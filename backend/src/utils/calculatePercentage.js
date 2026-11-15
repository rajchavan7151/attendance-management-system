/**
 * Calculates attendance statistics for a given set of records
 * @param {Array} records - Array of attendance records
 * @returns {Object} statistics
 */
const calculateAttendanceStats = (records = []) => {
  const total = records.length;
  if (total === 0) {
    return {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      percentage: 0,
      status: 'No Records',
      isDefaulter: false,
    };
  }

  const present = records.filter((r) => r.status === 'Present').length;
  const late = records.filter((r) => r.status === 'Late').length;
  // Many colleges treat Late as Present or half-present; we count Present + Late as attended
  const effectivePresent = present + late;
  const absent = records.filter((r) => r.status === 'Absent').length;

  const percentage = Math.round((effectivePresent / total) * 1000) / 10; // e.g. 85.5%

  let status = 'Good';
  let isDefaulter = false;

  if (percentage < 65) {
    status = 'Critical';
    isDefaulter = true;
  } else if (percentage < 75) {
    status = 'Warning';
    isDefaulter = true; // below 75% mandatory threshold
  }

  return {
    total,
    present,
    absent,
    late,
    effectivePresent,
    percentage,
    status,
    isDefaulter,
  };
};

module.exports = { calculateAttendanceStats };
