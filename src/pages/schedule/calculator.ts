let id: number | null = null;

export interface DaySchedule {
  players: string[];
}

export type DayType = { rest?: boolean };

interface Condition {
  dayCount: number;
  dayTypes: Array<DayType>;
  dutyCount: number;
  desCount: number;
  playerCount: number;
  excludeList: { who: string, when: string }[];
}

export function stopCalculate() {
  const hasCal = id !== null;
  if (id !== null) {
    clearInterval(id);
  }
  id = null;

  return hasCal;
}

// ============================= 计算 =============================
function getPlayersByPriority(condition: Condition, daySchedules: DaySchedule[]): string[] {
  const { dayCount, dayTypes, dutyCount, desCount, playerCount, excludeList } = condition;
  const lastDay = daySchedules.length - 1;
  const currentDay = lastDay + 1;

  const playersPriority: { [id: string]: number } = {};
  const playerDays: { [id: string]: number[] } = {};

  // 初始化计数器
  for (let i = 0; i < playerCount; i += 1) {
    playersPriority[i] = 1;
    playerDays[i] = [];
  }

  function updatePriority(playerId: string, callback: (value: number) => number) {
    if (playerId in playersPriority) {
      playersPriority[playerId] = callback(playersPriority[playerId]);
    }
  }

  // 排除日期不满足的
  for (let i = lastDay; i > lastDay - desCount && i >= 0; i -= 1) {
    const { players } = daySchedules[i];
    players.forEach(id => {
      delete playersPriority[id];
    });
  }

  // 排除排他性的
  excludeList.forEach(({ who, when }) => {
    if (Number(when) - 1 === currentDay) {
      delete playersPriority[who];
    }
  });

  // 降低近日已经值班过的优先级
  for (let i = lastDay; i >= 0; i -= 1) {
    const { players } = daySchedules[i];
    const distance = i + 1;
    players.forEach(id => {
      updatePriority(id, value => value * (0.8 ** distance));
    });
  }

  // 降低工作日总数优先级
  const { rest: currentRest = false } = dayTypes[currentDay] || {};
  daySchedules.forEach(({ players }, index) => {
    const { rest = false } = dayTypes[index] || {};
    players.forEach(id => {
      const player = playerDays[id];
      if (currentRest === rest) {
        player.push(index);
      }
    });
  });
  
  console.log('>>>', playerDays);

  return Object.keys(playersPriority).sort((id1, id2) => (
    playersPriority[id2] - playersPriority[id1]
  ));
}

export function startCalculate(condition, log, callback) {
  const { dayCount, dayTypes, dutyCount, desCount, playerCount, excludeList } = condition;
  console.log('Condition:', condition);

  if(stopCalculate()) {
    log({ style: { color: 'blue' } }, '中断，重新计算……');
  } else {
    log({ style: { color: 'blue' } }, '开始计算……');
  }

  function finish(daySchedules: DaySchedule[] | null) {
    stopCalculate();
    log({ style: { color: 'blue' } }, '计算完成……');
    callback(daySchedules && { daySchedules, dayTypes });
  }

  // 初始化数值
  let daySchedules: DaySchedule[] = [];

  id = window.setInterval(() => {
    const currentDay = daySchedules.length;
    const players = getPlayersByPriority(condition, daySchedules);

    // 选取玩家入场
    const selectedPlayers = players.slice(0, dutyCount);
    log('第', currentDay + 1, '天，选取', JSON.stringify(selectedPlayers), '位');
    console.log('Players:', selectedPlayers);
    if (selectedPlayers.length < dutyCount) {
      finish(null);
      return;
    }

    daySchedules.push({
      players: selectedPlayers,
    });

    if (currentDay === dayCount) {
      finish(daySchedules);
    }
  }, 100);
}




// // Looper
// function process() {
//   const myDays = new Array(daysProps.value)
//     .fill()
//     .map((_, index) => (days[index] || {}));
//   const restDays = myDays.filter(day => day.rest).length;
//   const workDays = daysProps.value - restDays;
//   const avgWorkDays = workDays * dutyProps.value / countProps.value;
//   const avgRestDays = restDays * dutyProps.value / countProps.value;
  
//   addLog('工作日', workDays, '天，休息日', restDays, '天');
//   addLog('人均工作日', avgWorkDays.toFixed(2), '天，休息日', avgRestDays.toFixed(2), '天');

//   // 计算
//   function getEnabledPlayers(dayIndex) {
//     const subScheduleList = scheduleList.slice(0, dayIndex);
//     const currentDay = days[dayIndex] || {};

//     const ids = {};
//     const workDutyIds = {};
//     const restDutyIds = {};

//     new Array(countProps.value)
//       .fill()
//       .forEach((_, id) => {
//         ids[id] = 100;
//         workDutyIds[id] = 0;
//         restDutyIds[id] = 0;
//       });

//     // =========== 时间搜索 ===========
//     subScheduleList.forEach((dayIds, scheduleIndex) => {
//       const day = days[scheduleIndex] || {};
//       const distance = dayIndex - scheduleIndex;
        
//       dayIds.forEach(id => {
//         if (distance <= desProps.value) {
//           // 删除时间不对的
//           delete ids[id];
//         } else {
//           // 提升时间相距远的优先级
//           ids[id] += (distance + 1) * 10;
//         }

//         // 记录值班量
//         if (day.rest) {
//           restDutyIds[id] += 1;
//         } else {
//           workDutyIds[id] += 1;
//         }
//       });
//     });

//     // =========== 提升排班数量不够的人 ===========
//     const maxValue = Math.max(...Object.values(ids));
//     const maxWorkDuty = Math.max(...Object.values(workDutyIds));
//     const maxRestDuty = Math.max(...Object.values(restDutyIds));
//     Object.keys(ids).forEach((id) => {
//       if (currentDay.rest) {
//         ids[id] += (maxRestDuty - restDutyIds[id]) * maxValue;
//       } else {
//         ids[id] += (maxWorkDuty - workDutyIds[id]) * maxValue;
//       }
//     });

//     return Object.keys(ids).sort((id_a, id_b) => (
//       ids[id_b] - ids[id_a]
//     ));
//   }
//   const scheduleList = [];
//   for (let i = 0; i < myDays.length ; i += 1) {
//     const dayIds = getEnabledPlayers(i);
//     if (dayIds.length < dutyProps.value) {
//       addLog({ style: { color: 'red' } }, '没有匹配项，退出……');
//       return;
//     }

//     scheduleList.push(dayIds.slice(0, dutyProps.value));
//   }

//   // ====================== 统计结果 ======================
//   setCalculating(false);

//   const players = {};
//   scheduleList.forEach((ids, dayIndex) => {
//     const day = {
//       ...days[dayIndex],
//       index: dayIndex,
//     };

//     ids.forEach(id => {
//       const playerDays = players[id] = players[id] || [];
//       playerDays.push(day);
//     });
//   });

//   setResult({
//     scheduleList,
//     players,
//   });
//   console.log('>>>', scheduleList);
// }