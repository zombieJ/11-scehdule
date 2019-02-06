import React from 'react';
import { Table, Tag } from 'antd';
import { DaySchedule, DayType } from '../calculator';

const workColor = '#fa8c16';
const restColor = '#a0d911';

interface PreviewProps {
  result?: {
    daySchedules: DaySchedule[];
    dayTypes: Array<DayType | null>;
  };
}

function renderColumns(dayTypes: Array<DayType | null>) {
  return [
    {
      title: '人员编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render:(id: string) => Number(id) + 1,
    },
    {
      title: '排班',
      dataIndex: 'days',
      key: 'days',
      render:(days: number[]) => (
        <div>
          {(days || []).map((day: number) => {
            const { rest }: DayType = dayTypes[day] || {};
            return (
              <Tag color={rest ? restColor : workColor} key={day}>第{day + 1}天</Tag>
            );
          })}
        </div>
      ),
    },
  ];
}

const Preview: React.SFC<PreviewProps> = ({ result }) => {
  const { daySchedules = [], dayTypes = [] } = result || {};

  // 转成 Players 视角
  const playerStatistic: { [id: string]: number[] } = {};
  (daySchedules || []).forEach(({ players }, dayIndex) => {
    (players || []).forEach(id => {
      const playerDays: number[] = playerStatistic[id] = playerStatistic[id] || [];
      playerDays.push(dayIndex);
    });
  });

  const dataSource = Object.keys(playerStatistic).map((id) => ({
    id,
    days: playerStatistic[id],
  }));

  return (
    <Table dataSource={dataSource} columns={renderColumns(dayTypes)} pagination={false} />
  );
};

export default Preview;