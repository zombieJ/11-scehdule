import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Icon, Select, Row, Col, Tooltip, Form } from 'antd';
import classNames from 'classnames';
import { useInput } from '@/utils/useHooks';
import styles from './index.less';

const { Option } = Select;

export default function() {
  const daysProps = useInput(14);
  const countProps = useInput(5);
  const dutyProps = useInput(1);
  const desProps = useInput(2);
  const [days, setDays] = useState([]);
  const [excludes, setExcludes] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [logs, setLogs] = useState([]);
  const intervalRef = useRef();
  const [result, setResult] = useState();

  // 更新排他
  function updateExcludes(exclude, who, when) {
    const newExcludes = [...excludes];
    const index = newExcludes.indexOf(exclude);
    const newExclude = newExcludes[index] = {
      ...exclude,
    };
    newExclude.who = who;
    newExclude.when = when;
    setExcludes(newExcludes);
  }

  // 更新日志
  let myLogs = [...logs];
  function addLog(...args) {
    let myArgs = [...args];
    let config = null;
    if (typeof myArgs[0] === 'object') {
      config = myArgs[0];
      myArgs = myArgs.slice(1);
    } 

    const log = {
      text: myArgs.join(' '),
      ...config,
    };
    myLogs = [...myLogs, log].slice(-5);
    setLogs(myLogs);
  }

  // =========================== 计算 ===========================
  // Clean up
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  // Looper
  function process() {
    const myDays = new Array(daysProps.value)
      .fill()
      .map((_, index) => (days[index] || {}));
    const restDays = myDays.filter(day => day.rest).length;
    const workDays = daysProps.value - restDays;
    const avgWorkDays = workDays * dutyProps.value / countProps.value;
    const avgRestDays = restDays * dutyProps.value / countProps.value;
    
    addLog('工作日', workDays, '天，休息日', restDays, '天');
    addLog('人均工作日', avgWorkDays.toFixed(2), '天，休息日', avgRestDays.toFixed(2), '天');

    // 计算
    function getEnabledPlayers(dayIndex) {
      const subScheduleList = scheduleList.slice(0, dayIndex);
      const currentDay = days[dayIndex] || {};

      const ids = {};
      const workDutyIds = {};
      const restDutyIds = {};

      new Array(countProps.value)
        .fill()
        .forEach((_, id) => {
          ids[id] = 100;
          workDutyIds[id] = 0;
          restDutyIds[id] = 0;
        });

      // =========== 时间搜索 ===========
      subScheduleList.forEach((dayIds, scheduleIndex) => {
        const day = days[scheduleIndex] || {};
        const distance = dayIndex - scheduleIndex;
          
        dayIds.forEach(id => {
          if (distance <= desProps.value) {
            // 删除时间不对的
            delete ids[id];
          } else {
            // 提升时间相距远的优先级
            ids[id] += (distance + 1) * 10;
          }

          // 记录值班量
          if (day.rest) {
            restDutyIds[id] += 1;
          } else {
            workDutyIds[id] += 1;
          }
        });
      });

      // =========== 提升排班数量不够的人 ===========
      const maxValue = Math.max(...Object.values(ids));
      const maxWorkDuty = Math.max(...Object.values(workDutyIds));
      const maxRestDuty = Math.max(...Object.values(restDutyIds));
      Object.keys(ids).forEach((id) => {
        if (currentDay.rest) {
          ids[id] += (maxRestDuty - restDutyIds[id]) * maxValue;
        } else {
          ids[id] += (maxWorkDuty - workDutyIds[id]) * maxValue;
        }
      });

      return Object.keys(ids).sort((id_a, id_b) => (
        ids[id_b] - ids[id_a]
      ));
    }
    const scheduleList = [];
    for (let i = 0; i < myDays.length ; i += 1) {
      const dayIds = getEnabledPlayers(i);
      if (dayIds.length < dutyProps.value) {
        addLog({ style: { color: 'red' } }, '没有匹配项，退出……');
        return;
      }

      scheduleList.push(dayIds.slice(0, dutyProps.value));
    }

    // ====================== 统计结果 ======================
    setCalculating(false);

    const players = {};
    scheduleList.forEach((ids, dayIndex) => {
      const day = {
        ...days[dayIndex],
        index: dayIndex,
      };

      ids.forEach(id => {
        const playerDays = players[id] = players[id] || [];
        playerDays.push(day);
      });
    });

    setResult({
      scheduleList,
      players,
    });
    console.log('>>>', scheduleList);

    // let index = 0;
    // return setInterval(() => {
    //   index += 1;
    //   addLog('序列', index, '……');

    //   // 初始化
    //   const seq = new Array(daysProps.value).fill().map(() => ({
    //     who: [],
    //   }));

    //   // 优先处理周末
    //   myDays.forEach((day, index) => {
    //     const isRest = day.rest;
    //     // if () {}
    //   });
    // }, 1000);
  }

  // Submit
  function doCalculation() {
    if (calculating) {
      addLog({ style: { color: 'blue' } }, '中断，重新计算……');
    } else {
      addLog({ style: { color: 'blue' } }, '开始计算……');
    }

    // Do calculating
    clearInterval(intervalRef.current);
    intervalRef.current = process();

    setCalculating(true);
  }

  return (
    <div>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={10}>
          <Form>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="总天数">
                  <Input type="number" {...daysProps} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="总人数">
                  <Input type="number" {...countProps} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="每天至少值班人数">
                  <Input type="number" {...dutyProps} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={<Tooltip overlayClassName={styles.tooltip} title="当值为 0 时，表示可以一天接着一天值班。唯一时，两次值班间至少间隔 1 天。以此类推。">
                    值班间隔数 <Icon type="question-circle" />
                    </Tooltip>
                  }
                >
                  <Input type="number" {...desProps} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="天数表">
              <div className={styles.days}>
                {new Array(daysProps.value).fill().map((_, index) => {
                  const day = days[index] || {};
                  return (
                    <Tooltip
                      title={`第 ${index + 1} 天`}
                      overlayClassName={styles.tooltip}
                      key={index}
                    >
                      <div
                        className={classNames(styles.day, day.rest && styles.rest)}
                        role="button"
                        onClick={() => {
                          const cloneDays = [...days];
                          const newDay = { ...day };
                          newDay.rest = !newDay.rest;
                          cloneDays[index] = newDay;
                          setDays(cloneDays);
                        }}
                      >
                        {day.rest ? '休' : '工'}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </Form.Item>

            <div className={styles.excludes}>
              <h3>排他性</h3>
              <ul>
                {excludes.map((exclude, index) => {
                  return (
                    <li
                      key={index}
                    >
                      <a onClick={() => {
                        const newExcludes = excludes.filter(e => e !== exclude);
                        setExcludes(newExcludes);
                      }}>
                        <Icon type="close" />
                      </a>
                      <Select
                        size="small"
                        className={styles.who}
                        value={exclude.who || ''}
                        onChange={(who) => {
                          updateExcludes(exclude, who, exclude.when);
                        }}
                      >
                        {new Array(countProps.value).fill().map((_, _index) => (
                          <Option key={_index} value={String(_index)}>
                            {_index + 1} 号
                          </Option>
                        ))}
                      </Select>
                      不能在第
                      <Input
                        type="number"
                        className={styles.when}
                        size="small"
                        value={exclude.when || ''}
                        onChange={({ target: { value: when } }) => {
                          updateExcludes(exclude, exclude.who, when);
                        }}
                      />
                      天工作
                    </li>
                  );
                })}
              </ul>
              <a
                className={styles.new}
                onClick={() => {
                  setExcludes([
                    ...excludes,
                    {},
                  ]);
                }}
              >
                + 新增排他
              </a>
            </div>
          </Form>

          <br />
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={doCalculation}>
              {calculating && <Icon type="loading" spin />}
              {' '}
              开始计算
            </Button>
          </div>
        </Col>

        {/* 计算结果 */}
        <Col xs={24} sm={12} md={14}>
          {logs.length > 0 &&
            <pre className={styles.logs}>
              {logs.map((log, index) => (
                <div key={index} style={log.style}>
                  {log.text}
                </div>
              ))}
            </pre>
          }
          <table className={styles.result}>
            <tbody>
              {result && new Array(countProps.value).fill().map((_, index) => (
                <tr key={index}>
                  <th>{index + 1} 号</th>
                  <td>
                    {result.players[index].map(day => (
                      <span
                        key={day.index}
                        className={classNames(styles.unit, day.rest && styles.rest)}
                      >
                        第 {day.index + 1} 天
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Col>
      </Row>
    </div>
  );
}
