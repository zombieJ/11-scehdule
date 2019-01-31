import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Icon, Select, Row, Col, Tooltip, Form } from 'antd';
import classNames from 'classnames';
import { useInput } from '@/utils/useHooks';

import Days from './components/Days';
import { startCalculate, stopCalculate } from './calculator.ts';
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
      stopCalculate();
    };
  }, []);

  // Submit
  function doCalculation() {
    setCalculating(true);
    startCalculate({
      dayCount: daysProps.value,
      dayTypes: days,
      playerCount: countProps.value,
      dutyCount: dutyProps.value,
      desCount: desProps.value,
      excludeList: excludes,
    }, addLog, (result) => {
      console.log('Result:', result);
      setResult(result);
      setCalculating(false);
    });
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
              <Days daysProps={daysProps} days={days} setDays={setDays} />
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

          {result && <pre>{JSON.stringify(result, null, 3)}</pre>}
          <table className={styles.result}>
            <tbody>
              {result && new Array(countProps.value).fill().map((_, index) => (
                <tr key={index}>
                  <th>{index + 1} 号</th>
                  <td>
                    {/* {result.players[index].map(day => (
                      <span
                        key={day.index}
                        className={classNames(styles.unit, day.rest && styles.rest)}
                      >
                        第 {day.index + 1} 天
                      </span>
                    ))} */}
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
