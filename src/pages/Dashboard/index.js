import React, { useState, useMemo, useEffect } from 'react';
import {
  format,
  subDays,
  addDays,
  setMinutes,
  setHours,
  setSeconds,
  isBefore,
  isEqual,
  parseISO,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import pt from 'date-fns/locale/pt';

import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import api from '~/services/api';

import { Container, Time } from './styles';

const range = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default function Dashboard() {
  const [schedule, setSchedule] = useState([]);
  const [date, setDate] = useState(new Date());

  const dateFormatted = useMemo(
    () => format(date, "dd 'de' MMMM", { locale: pt }),
    [date]
  );

  useEffect(() => {
    async function loadSchedule() {
      // const d1 = '2019-11-13 12:00:00 -0300';
      // const d2 = '2019-11-13 12:00:00 -0300';

      // console.log(isEqual(parseISO(d1), parseISO(d2)));

      const response = await api.get('schedules', { params: { date } });

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      console.log(response.data);

      const data = range.map(hour => {
        const checkDate = setSeconds(setMinutes(setHours(date, hour), 0), 0);
        const compareDate = utcToZonedTime(checkDate, timezone);
        const formattedDate = format(checkDate, 'yyyy-MM-dd HH:mm:ss zzzz');

        return {
          time: `${hour}:00h`,
          past: isBefore(compareDate, new Date()),
          appointment: response.data.find(appointment => {
            return isEqual(parseISO(formattedDate), parseISO(appointment.date));
          }),
        };
      });

      setSchedule(data);
    }

    loadSchedule();
  }, [date]);

  function handlePreviousDay() {
    setDate(subDays(date, 1));
  }

  function handleNextDay() {
    setDate(addDays(date, 1));
  }

  return (
    <Container>
      <header>
        <button type="button" onClick={handlePreviousDay}>
          <MdChevronLeft size={36} color="#fff" />
        </button>

        <strong>{dateFormatted}</strong>

        <button type="button" onClick={handleNextDay}>
          <MdChevronRight size={36} color="#fff" />
        </button>
      </header>

      <ul>
        {schedule.map(time => (
          <Time key={time.time} past={time.past} available={!time.appointment}>
            <strong>{time.time}</strong>
            <span>
              {time.appointment ? time.appointment.user.name : 'Em aberto'}
            </span>
          </Time>
        ))}
      </ul>
    </Container>
  );
}
