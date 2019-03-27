import * as React from 'react';
import {
  differenceInCalendarDays,
  differenceInWeeks,
  distanceInWordsToNow,
  format,
} from 'date-fns';

export function humanAge(date: Date, brief = false, withPrefix = false): string {
  if (!date) {
    return 'a while ago';
  }
  const ms = Date.now() - date.getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds === 1) {
    if (brief) {
      return '1s';
    }
    return '1 second ago';
  }
  if (seconds < 60) {
    if (brief) {
      return `${seconds}s`;
    }
    return `${seconds} seconds ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes <= 1) {
    if (brief) {
      return '1m';
    }
    return '1 minute ago';
  }
  if (minutes <= 90) {
    if (brief) {
      return `${minutes}m`;
    }
    return `${minutes} minutes ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours <= 1) {
    if (brief) {
      return '1h';
    }
    return '1 hour ago';
  }
  if (hours < 48) {
    if (brief) {
      return `${hours}h`;
    }
    return `${hours} hours ago`;
  }
  const days = differenceInCalendarDays(new Date(), date);
  if (days <= 1) {
    if (brief) {
      return '1d';
    }
    return '1 day ago';
  }
  if (days < 30) {
    if (brief) {
      return `${days}d`;
    }
    return `${days} days ago`;
  }
  if (withPrefix) {
    return `on ${format(date, 'YYYY-MM-DD')}`;
  } else {
    return format(date, 'YYYY-MM-DD');
  }
}

export function relativeDay(time: Date) {
  const now = new Date();
  if (differenceInWeeks(now, time) < 1) {
    return format(time, 'dddd');
  } else {
    return `${distanceInWordsToNow(time)} ago`;
  }
}

export function RelativeDate(
    { date, brief = false, withPrefix = false }:
        { date: Date | string, brief?: boolean, withPrefix?: boolean }) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return (
    <span className="date" title={format(date, 'MMM Do, YYYY H:mm:ss')}>
      {humanAge(d, brief, withPrefix)}
    </span>
  );
}
