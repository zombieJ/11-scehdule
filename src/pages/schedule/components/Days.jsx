import classNames from 'classnames';
import { Button, Input, Icon, Select, Row, Col, Tooltip, Form } from 'antd';
import styles from './Days.less';

export default ({ daysProps, days, setDays }) => {
  return (
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
  );
};