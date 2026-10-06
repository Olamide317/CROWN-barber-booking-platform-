import Appointment from "../models/Appointment.js";
import Barber from "../models/Barber.js";
import BusinessSettings from "../models/BusinessSettings.js";

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
}) => {
  const barbers = await Barber.find({
    isActive: true,
    skills: serviceId,
  });

  const eligibleBarbers = [];

  for (const barber of barbers) {
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

    const worksDuringAppointment = isWithinWorkingHours(
      barber.availability,
      dayOfWeek,
      startTime,
      endTime,
    );

    if (!worksDuringAppointment) {
      continue;
    }

    const hasConflict = await hasAppointmentConflict(
      barber._id,
      startAt,
      endAt,
    );

    if (hasConflict) {
      continue;
    }

    eligibleBarbers.push(barber);
  }

  return eligibleBarbers;
};

export const checkWalkInCoverage = async ({
  assignedBarberId,
  startAt,
  endAt,
  dayOfWeek,
}) => {
  const settings = await BusinessSettings.findOne();

  if (!settings) {
    throw new Error("Business settings not found");
  }

  const activeBarbers = await Barber.find({
    isActive: true,
  });

  let availableBarbers = 0;

  for (const barber of activeBarbers) {
    // The barber being assigned to the appointment
    // should not count toward walk-in coverage.
    if (barber._id.toString() === assignedBarberId.toString()) {
      continue;
    }

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

    const worksDuringAppointment = isWithinWorkingHours(
      barber.availability,
      dayOfWeek,
      startTime,
      endTime,
    );

    if (!worksDuringAppointment) {
      continue;
    }

    const hasConflict = await hasAppointmentConflict(
      barber._id,
      startAt,
      endAt,
    );

    if (hasConflict) {
      continue;
    }

    availableBarbers++;
  }

  return availableBarbers >= settings.minimumAvailableBarbers;
};

export const findNearbyAvailableSlots = async ({
  serviceId,
  requestedStartAt,
  serviceDuration,
  dayOfWeek,
}) => {
  const alternatives = [];

  // Check up to 4 hours around the requested time
  const searchRangeMinutes = 240;

  // Search in 15-minute increments
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

      const eligibleBarbers = await getEligibleBarbers({
        serviceId,
        startAt,
        endAt,
        dayOfWeek,
      });

      if (eligibleBarbers.length === 0) {
        continue;
      }

      const validBarbers = [];

      for (const barber of eligibleBarbers) {
        const hasCoverage = await checkWalkInCoverage({
          assignedBarberId: barber._id,
          startAt,
          endAt,
          dayOfWeek,
        });

        if (hasCoverage) {
          validBarbers.push(barber);
        }
      }

      if (validBarbers.length === 0) {
        continue;
      }

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
