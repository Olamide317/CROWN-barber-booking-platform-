import Appointment from "../models/Appointment.js";
import Barber from "../models/Barber.js";
import BusinessSettings from "../models/BusinessSettings.js";

const getAppointmentsForPeriod = async ({ startAt, endAt, barberIds }) => {
  return Appointment.find({
    barber: { $in: barberIds },
    status: { $ne: "cancelled" },
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  });
};

const hasAppointmentConflictFromList = ({
  barberId,
  requestedStartAt,
  requestedEndAt,
  appointments,
}) => {
  return appointments.some((appointment) => {
    if (appointment.barber.toString() !== barberId.toString()) {
      return false;
    }

    return (
      appointment.startAt < requestedEndAt &&
      appointment.endAt > requestedStartAt
    );
  });
};

const getAvailableBarbersForPeriod = ({
  startAt,
  endAt,
  dayOfWeek,
  activeBarbers,
  appointments,
}) => {
  const availableBarbers = [];

  const startTime = startAt.toLocaleTimeString("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const endTime = endAt.toLocaleTimeString("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  for (const barber of activeBarbers) {
    const worksDuringAppointment = isWithinWorkingHours(
      barber.availability,
      dayOfWeek,
      startTime,
      endTime,
    );

    if (!worksDuringAppointment) {
      continue;
    }

    const hasConflict = hasAppointmentConflictFromList({
      barberId: barber._id,
      requestedStartAt: startAt,
      requestedEndAt: endAt,
      appointments,
    });

    if (hasConflict) {
      continue;
    }

    availableBarbers.push(barber);
  }

  return availableBarbers;
};

export const generateTimeSlots = (
  startTime,
  endTime,
  intervalMinutes,
  serviceDuration,
) => {
  const slots = [];

  let currentMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  while (currentMinutes + serviceDuration <= endMinutes) {
    slots.push(minutesToTime(currentMinutes));

    currentMinutes += intervalMinutes;
  }

  return slots;
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(
    2,
    "0",
  )}`;
};

export const hasAppointmentConflict = async (
  barberId,
  requestedStartAt,
  requestedEndAt,
) => {
  const conflictingAppointment = await Appointment.findOne({
    barber: barberId,
    status: { $ne: "cancelled" },
    startAt: { $lt: requestedEndAt },
    endAt: { $gt: requestedStartAt },
  });

  return Boolean(conflictingAppointment);
};

export const isWithinWorkingHours = (
  availability,
  dayOfWeek,
  startTime,
  endTime,
) => {
  const dayAvailability = availability[dayOfWeek];

  if (!dayAvailability || !dayAvailability.isWorking) {
    return false;
  }

  return (
    startTime >= dayAvailability.startTime && endTime <= dayAvailability.endTime
  );
};

export const getEligibleBarbers = async ({
  serviceId,
  startAt,
  endAt,
  dayOfWeek,
  barbers,
  appointments,
}) => {
  const eligibleBarbers = [];

  const startTime = startAt.toLocaleTimeString("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const endTime = endAt.toLocaleTimeString("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const serviceBarbers = barbers.filter((barber) =>
    barber.skills.some((skill) => skill.toString() === serviceId.toString()),
  );

  for (const barber of serviceBarbers) {
    const worksDuringAppointment = isWithinWorkingHours(
      barber.availability,
      dayOfWeek,
      startTime,
      endTime,
    );

    if (!worksDuringAppointment) {
      continue;
    }

    const hasConflict = hasAppointmentConflictFromList({
      barberId: barber._id,
      requestedStartAt: startAt,
      requestedEndAt: endAt,
      appointments,
    });

    if (hasConflict) {
      continue;
    }

    eligibleBarbers.push(barber);
  }

  return eligibleBarbers;
};

export const checkWalkInCoverage = ({
  assignedBarberId,
  availableBarbers,
  minimumAvailableBarbers,
}) => {
  const availableAfterAssignment = availableBarbers.filter(
    (barber) => barber._id.toString() !== assignedBarberId.toString(),
  );

  return availableAfterAssignment.length >= minimumAvailableBarbers;
};

export const findNearbyAvailableSlots = async ({
  serviceId,
  requestedStartAt,
  serviceDuration,
}) => {
  const alternatives = [];

  // Temporary value.
  const searchRangeMinutes = 120;

  // 1. Load reusable data
  const settings = await BusinessSettings.findOne();

  if (!settings) {
    throw new Error("Business settings not found");
  }

  const activeBarbers = await Barber.find({
    isActive: true,
  });

  if (activeBarbers.length === 0) {
    return alternatives;
  }

  const barberIds = activeBarbers.map((barber) => barber._id);

  // 2. Determine the entire search period
  const earliestStartAt = new Date(
    requestedStartAt.getTime() - searchRangeMinutes * 60 * 1000,
  );

  const latestStartAt = new Date(
    requestedStartAt.getTime() + searchRangeMinutes * 60 * 1000,
  );

  const latestEndAt = new Date(
    latestStartAt.getTime() + serviceDuration * 60 * 1000,
  );

  // 3. Load appointments once
  const appointments = await getAppointmentsForPeriod({
    startAt: earliestStartAt,
    endAt: latestEndAt,
    barberIds,
  });

  // 4. Search nearby times
  for (let offset = 15; offset <= searchRangeMinutes; offset += 15) {
    const beforeStart = new Date(
      requestedStartAt.getTime() - offset * 60 * 1000,
    );

    const afterStart = new Date(
      requestedStartAt.getTime() + offset * 60 * 1000,
    );

    const candidateStarts = [beforeStart, afterStart];

    for (const startAt of candidateStarts) {
      const endAt = new Date(startAt.getTime() + serviceDuration * 60 * 1000);

      // Determine the candidate's local day
      const candidateDayOfWeek = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Lagos",
        weekday: "long",
      })
        .format(startAt)
        .toLowerCase();

      // Find eligible barbers
      const eligibleBarbers = await getEligibleBarbers({
        serviceId,
        startAt,
        endAt,
        dayOfWeek: candidateDayOfWeek,
        barbers: activeBarbers,
        appointments,
      });

      if (eligibleBarbers.length === 0) {
        continue;
      }

      // Check walk-in
      const availableBarbers = getAvailableBarbersForPeriod({
        startAt,
        endAt,
        dayOfWeek: candidateDayOfWeek,
        activeBarbers,
        appointments,
      });

      const validBarbers = eligibleBarbers.filter((barber) =>
        checkWalkInCoverage({
          assignedBarberId: barber._id,
          availableBarbers,
          minimumAvailableBarbers: settings.minimumAvailableBarbers,
        }),
      );

      if (validBarbers.length === 0) continue;

      alternatives.push({
        startAt,
        endAt,
        minutesFromRequestedTime: offset,
        eligibleBarbers: validBarbers,
      });
    }
  }

  return alternatives;
};
