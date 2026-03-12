const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    function toSeconds(timeStr) {
        timeStr = timeStr.trim();
        let parts = timeStr.split(' ');
        let timeParts = parts[0].split(':');
        let period = parts[1].toLowerCase();
        
        let hours = parseInt(timeParts[0]);
        let minutes = parseInt(timeParts[1]);
        let seconds = parseInt(timeParts[2]);
        
        if (period === 'am' && hours === 12) hours = 0;
        if (period === 'pm' && hours !== 12) hours += 12;
        
        return hours * 3600 + minutes * 60 + seconds;
    }
    
    let diff = toSeconds(endTime) - toSeconds(startTime);
    
    let h = Math.floor(diff / 3600);
    let m = Math.floor((diff % 3600) / 60);
    let s = diff % 60;
    
    let mm = m.toString().padStart(2, '0');
    let ss = s.toString().padStart(2, '0');
    
    return `${h}:${mm}:${ss}`;
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    function toSeconds(timeStr) {
        timeStr = timeStr.trim();
        let parts = timeStr.split(' ');
        let timeParts = parts[0].split(':');
        let period = parts[1].toLowerCase();
        
        let hours = parseInt(timeParts[0]);
        let minutes = parseInt(timeParts[1]);
        let seconds = parseInt(timeParts[2]);
        
        if (period === 'am' && hours === 12) hours = 0;
        if (period === 'pm' && hours !== 12) hours += 12;
        
        return hours * 3600 + minutes * 60 + seconds;
    }

    function secondsToString(totalSeconds) {
        let h = Math.floor(totalSeconds / 3600);
        let m = Math.floor((totalSeconds % 3600) / 60);
        let s = totalSeconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    const DELIVERY_START = 8 * 3600;   
    const DELIVERY_END = 22 * 3600;    

    let start = toSeconds(startTime);
    let end = toSeconds(endTime);

    let idleBeforeDelivery = 0;
    let idleAfterDelivery = 0;

   
    if (start < DELIVERY_START) {
        idleBeforeDelivery = Math.min(end, DELIVERY_START) - start;
    }

    
    if (end > DELIVERY_END) {
        idleAfterDelivery = end - Math.max(start, DELIVERY_END);
    }

    let totalIdle = idleBeforeDelivery + idleAfterDelivery;

    return secondsToString(totalIdle);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    function toSeconds(timeStr) {
        timeStr = timeStr.trim();
        let parts = timeStr.split(':');
        let hours = parseInt(parts[0]);
        let minutes = parseInt(parts[1]);
        let seconds = parseInt(parts[2]);
        return hours * 3600 + minutes * 60 + seconds;
    }

    function secondsToString(totalSeconds) {
        let h = Math.floor(totalSeconds / 3600);
        let m = Math.floor((totalSeconds % 3600) / 60);
        let s = totalSeconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    let diff = toSeconds(shiftDuration) - toSeconds(idleTime);
    return secondsToString(diff);
}
// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    function toSeconds(timeStr) {
        timeStr = timeStr.trim();
        let parts = timeStr.split(':');
        let hours = parseInt(parts[0]);
        let minutes = parseInt(parts[1]);
        let seconds = parseInt(parts[2]);
        return hours * 3600 + minutes * 60 + seconds;
    }

    const NORMAL_QUOTA = (8 * 3600) + (24 * 60);  
    const EID_QUOTA = 6 * 3600;                    

  
    let dateParts = date.split('-');
    let year = parseInt(dateParts[0]);
    let month = parseInt(dateParts[1]);
    let day = parseInt(dateParts[2]);

    
    let isEidPeriod = (year === 2025 && month === 4 && day >= 10 && day <= 30);

    let quota = isEidPeriod ? EID_QUOTA : NORMAL_QUOTA;
    let active = toSeconds(activeTime);

    return active >= quota;
}
// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    const fs = require('fs');

    function toSeconds(timeStr) {
        timeStr = timeStr.trim();
        let parts = timeStr.split(' ');
        let timeParts = parts[0].split(':');
        let period = parts[1].toLowerCase();

        let hours = parseInt(timeParts[0]);
        let minutes = parseInt(timeParts[1]);
        let seconds = parseInt(timeParts[2]);

        if (period === 'am' && hours === 12) hours = 0;
        if (period === 'pm' && hours !== 12) hours += 12;

        return hours * 3600 + minutes * 60 + seconds;
    }

    function secondsToString(totalSeconds) {
        let h = Math.floor(totalSeconds / 3600);
        let m = Math.floor((totalSeconds % 3600) / 60);
        let s = totalSeconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function getShiftDurationLocal(startTime, endTime) {
        let diff = toSeconds(endTime) - toSeconds(startTime);
        return secondsToString(diff);
    }

    function getIdleTimeLocal(startTime, endTime) {
        const DELIVERY_START = 8 * 3600;
        const DELIVERY_END = 22 * 3600;

        let start = toSeconds(startTime);
        let end = toSeconds(endTime);

        let idleBefore = 0;
        let idleAfter = 0;

        if (start < DELIVERY_START) {
            idleBefore = Math.min(end, DELIVERY_START) - start;
        }
        if (end > DELIVERY_END) {
            idleAfter = end - Math.max(start, DELIVERY_END);
        }

        return secondsToString(idleBefore + idleAfter);
    }

    function getActiveTimeLocal(shiftDuration, idleTime) {
        function toSec(timeStr) {
            let parts = timeStr.split(':');
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
        let diff = toSec(shiftDuration) - toSec(idleTime);
        return secondsToString(diff);
    }

    function metQuotaLocal(date, activeTime) {
        const NORMAL_QUOTA = (8 * 3600) + (24 * 60);
        const EID_QUOTA = 6 * 3600;

        let dateParts = date.split('-');
        let year = parseInt(dateParts[0]);
        let month = parseInt(dateParts[1]);
        let day = parseInt(dateParts[2]);

        let isEidPeriod = (year === 2025 && month === 4 && day >= 10 && day <= 30);
        let quota = isEidPeriod ? EID_QUOTA : NORMAL_QUOTA;

        let parts = activeTime.split(':');
        let activeSec = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);

        return activeSec >= quota;
    }

    
    let content = fs.readFileSync(textFile, 'utf8');
    let lines = content.split('\n').filter(line => line.trim() !== '');

    
    for (let line of lines) {
        let cols = line.split(',');
        if (cols[0].trim() === shiftObj.driverID.trim() && cols[2].trim() === shiftObj.date.trim()) {
            return {};
        }
    }


    let shiftDuration = getShiftDurationLocal(shiftObj.startTime, shiftObj.endTime);
    let idleTime = getIdleTimeLocal(shiftObj.startTime, shiftObj.endTime);
    let activeTime = getActiveTimeLocal(shiftDuration, idleTime);
    let quota = metQuotaLocal(shiftObj.date, activeTime);

    
    let newRecord = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: quota,
        hasBonus: false
    };

    
    let newLine = `${newRecord.driverID},${newRecord.driverName},${newRecord.date},${newRecord.startTime},${newRecord.endTime},${newRecord.shiftDuration},${newRecord.idleTime},${newRecord.activeTime},${newRecord.metQuota},${newRecord.hasBonus}`;

    
    let lastIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        let cols = lines[i].split(',');
        if (cols[0].trim() === shiftObj.driverID.trim()) {
            lastIndex = i;
        }
    }

    if (lastIndex === -1) {
        
        lines.push(newLine);
    } else {
       
        lines.splice(lastIndex + 1, 0, newLine);
    }

    
    fs.writeFileSync(textFile, lines.join('\n') + '\n', 'utf8');

    return newRecord;
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    const fs = require('fs');

    
    let content = fs.readFileSync(textFile, 'utf8');
    let lines = content.split('\n').filter(line => line.trim() !== '');

    
    for (let i = 0; i < lines.length; i++) {
        
       
        let cols = lines[i].split(',');

        
        if (cols[0].trim() === driverID.trim() && cols[2].trim() === date.trim()) {
            
        
            cols[9] = newValue.toString();

            
            lines[i] = cols.join(',');

            
            break;
        }
    }

   
    fs.writeFileSync(textFile, lines.join('\n') + '\n', 'utf8');
}


// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    const fs = require('fs');

    
    let content = fs.readFileSync(textFile, 'utf8');
    let lines = content.split('\n').filter(line => line.trim() !== '');


    let driverExists = false;
    for (let line of lines) {
        let cols = line.split(',');
        if (cols[0].trim() === driverID.trim()) {
            driverExists = true;
            break;
        }
    }

    
    if (!driverExists) return -1;

    let count = 0;
    for (let line of lines) {
        let cols = line.split(',');

        
        let lineDriverID = cols[0].trim();
        let lineDate = cols[2].trim();
        let lineHasBonus = cols[9].trim();

        
        let lineMonth = parseInt(lineDate.split('-')[1]);

        
        if (lineDriverID === driverID.trim() && 
            lineMonth === parseInt(month) && 
            lineHasBonus === 'true') {
            count++;
        }
    }

    return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    const fs = require('fs');

    let content = fs.readFileSync(textFile, 'utf8');
    let lines = content.split('\n').filter(line => line.trim() !== '');

    let totalSeconds = 0;

    for (let line of lines) {
        let cols = line.split(',');
        let lineDriverID = cols[0].trim();
        let lineDate = cols[2].trim();
        let lineActiveTime = cols[7].trim();

        let lineMonth = parseInt(lineDate.split('-')[1]);

        if (lineDriverID === driverID.trim() && lineMonth === parseInt(month)) {
            let parts = lineActiveTime.split(':');
            let seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            totalSeconds += seconds;
        }
    }

    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = totalSeconds % 60;

    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    const fs = require('fs');

    let content = fs.readFileSync(textFile, 'utf8');
    let lines = content.split('\n').filter(line => line.trim() !== '');

    let rateContent = fs.readFileSync(rateFile, 'utf8');
    let rateLines = rateContent.split('\n').filter(line => line.trim() !== '');

    let dayOff = '';
    for (let line of rateLines) {
        let cols = line.split(',');
        if (cols[0].trim() === driverID.trim()) {
            dayOff = cols[1].trim();
            break;
        }
    }

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let totalSeconds = 0;

    for (let line of lines) {
        let cols = line.split(',');
        let lineDriverID = cols[0].trim();
        let lineDate = cols[2].trim();

        let lineMonth = parseInt(lineDate.split('-')[1]);

        if (lineDriverID === driverID.trim() && lineMonth === parseInt(month)) {
            let dateParts = lineDate.split('-');
            let year = parseInt(dateParts[0]);
            let mon = parseInt(dateParts[1]) - 1;
            let day = parseInt(dateParts[2]);

            let dateObj = new Date(year, mon, day);
            let dayName = DAYS[dateObj.getDay()];

            if (dayName === dayOff) continue;

            let isEidPeriod = (year === 2025 && parseInt(dateParts[1]) === 4 && day >= 10 && day <= 30);
            let quota = isEidPeriod ? 6 * 3600 : (8 * 3600) + (24 * 60);

            totalSeconds += quota;
        }
    }

    let bonusDeduction = bonusCount * 2 * 3600;
    totalSeconds = Math.max(0, totalSeconds - bonusDeduction);

    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = totalSeconds % 60;

    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    const fs = require('fs');

    let rateContent = fs.readFileSync(rateFile, 'utf8');
    let rateLines = rateContent.split('\n').filter(line => line.trim() !== '');

    let basePay = 0;
    let tier = 0;

    for (let line of rateLines) {
        let cols = line.split(',');
        if (cols[0].trim() === driverID.trim()) {
            basePay = parseInt(cols[2].trim());
            tier = parseInt(cols[3].trim());
            break;
        }
    }

    function toSeconds(timeStr) {
        let parts = timeStr.trim().split(':');
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }

    let actualSeconds = toSeconds(actualHours);
    let requiredSeconds = toSeconds(requiredHours);

    if (actualSeconds >= requiredSeconds) return basePay;

    let missingSeconds = requiredSeconds - actualSeconds;

    const ALLOWED = { 1: 50, 2: 20, 3: 10, 4: 3 };
    let allowedSeconds = ALLOWED[tier] * 3600;

    if (missingSeconds <= allowedSeconds) return basePay;

    let billableSeconds = missingSeconds - allowedSeconds;
    let billableHours = Math.floor(billableSeconds / 3600);

    let deductionRatePerHour = Math.floor(basePay / 185);
    let salaryDeduction = billableHours * deductionRatePerHour;

    return basePay - salaryDeduction;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
