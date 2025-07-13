const MILLISEC_PER_SECOND = 1000;
const MILLISEC_PER_MINUTE = MILLISEC_PER_SECOND * 60;   //     60,000
const MILLISEC_PER_HOUR = MILLISEC_PER_MINUTE * 60;     //  3,600,000
const MILLISEC_PER_DAY = MILLISEC_PER_HOUR * 24;        // 86,400,000

export class TimeSpan {
    private _millisec: number;

    private static interval(value: number, scale: number): TimeSpan {
        if (Number.isNaN(value)) {
            throw new Error("Value cannot be null");
        }

        const tmp = value * scale;
        const millisec = TimeSpan.round(tmp + (value >= 0 ? 0.5 : -0.5));
        if ((millisec > TimeSpan.maxValue.totalMilliseconds) || (millisec < TimeSpan.minValue.totalMilliseconds)) {
            throw new Error("TimeSpan value too long");
        }

        return new TimeSpan(millisec);
    }

    private static round(n: number): number {
        if (n < 0) {
            return Math.ceil(n);
        } else if (n > 0) {
            return Math.floor(n);
        }

        return 0;
    }

    private static timeToMilliseconds(hour: number, minute: number, second: number): number {
        const totalSeconds = (hour * 3600) + (minute * 60) + second;
        if (totalSeconds > TimeSpan.maxValue.totalSeconds || totalSeconds < TimeSpan.minValue.totalSeconds) {
          throw new Error("TimeSpan value too long");
        }

        return totalSeconds * MILLISEC_PER_SECOND;
    }

    public static get zero(): TimeSpan {
        return new TimeSpan(0);
    }

    public static get maxValue(): TimeSpan {
        return new TimeSpan(Number.MAX_SAFE_INTEGER);
    }

    public static get minValue(): TimeSpan {
        return new TimeSpan(Number.MIN_SAFE_INTEGER);
    }

    public static fromDays(value: number): TimeSpan {
        return TimeSpan.interval(value, MILLISEC_PER_DAY);
    }

    public static fromHours(value: number): TimeSpan {
        return TimeSpan.interval(value, MILLISEC_PER_HOUR);
    }

    public static fromMilliseconds(value: number): TimeSpan {
        return TimeSpan.interval(value, 1);
    }

    public static fromMinutes(value: number): TimeSpan {
        return TimeSpan.interval(value, MILLISEC_PER_MINUTE);
    }

    public static fromSeconds(value: number): TimeSpan {
        return TimeSpan.interval(value, MILLISEC_PER_SECOND);
    }

    public static fromTime(hours: number, minutes: number, seconds: number): TimeSpan;
    public static fromTime(days: number, hours: number, minutes: number, seconds: number, milliseconds: number): TimeSpan;
    public static fromTime(daysOrHours: number, hoursOrMinutes: number, minutesOrSeconds: number, seconds?: number, milliseconds?: number): TimeSpan {
        if (milliseconds != undefined) {
            return this.fromTimeStartingFromDays(daysOrHours, hoursOrMinutes, minutesOrSeconds, seconds, milliseconds);
        } else {
            return this.fromTimeStartingFromHours(daysOrHours, hoursOrMinutes, minutesOrSeconds);
        }
    }

    private static fromTimeStartingFromHours(hours: number, minutes: number, seconds: number): TimeSpan {
        const millisec = TimeSpan.timeToMilliseconds(hours, minutes, seconds);
        return new TimeSpan(millisec);
    }

    private static fromTimeStartingFromDays(days: number, hours: number, minutes: number, seconds: number, milliseconds: number): TimeSpan {
        const totalMilliSeconds = (days * MILLISEC_PER_DAY) +
            (hours * MILLISEC_PER_HOUR) +
            (minutes * MILLISEC_PER_MINUTE) +
            (seconds * MILLISEC_PER_SECOND) +
            milliseconds;

        if (totalMilliSeconds > TimeSpan.maxValue.totalMilliseconds || totalMilliSeconds < TimeSpan.minValue.totalMilliseconds) {
          throw new Error("TimeSpan value too long");
        }
        return new TimeSpan(totalMilliSeconds);
    }

    constructor(millisec: number) {
        this._millisec = millisec;
    }

    public get days(): number {
        return TimeSpan.round(this._millisec / MILLISEC_PER_DAY);
    }

    public get hours(): number {
        return TimeSpan.round((this._millisec / MILLISEC_PER_HOUR) % 24);
    }

    public get minutes(): number {
        return TimeSpan.round((this._millisec / MILLISEC_PER_MINUTE) % 60);
    }

    public get seconds(): number {
        return TimeSpan.round((this._millisec / MILLISEC_PER_SECOND) % 60);
    }

    public get milliseconds(): number {
        return TimeSpan.round(this._millisec % 1000);
    }

    public get totalDays(): number {
        return this._millisec / MILLISEC_PER_DAY;
    }

    public get totalHours(): number {
        return this._millisec / MILLISEC_PER_HOUR;
    }

    public get totalMinutes(): number {
        return this._millisec / MILLISEC_PER_MINUTE;
    }

    public get totalSeconds(): number {
        return this._millisec / MILLISEC_PER_SECOND;
    }

    public get totalMilliseconds(): number {
        return this._millisec;
    }

    public add(timespan: TimeSpan): TimeSpan {
      const result = this._millisec + timespan.totalMilliseconds;
        return new TimeSpan(result);
    }

  public subtract(timespan: TimeSpan): TimeSpan {
    const result = this._millisec - timespan.totalMilliseconds;
        return new TimeSpan(result);
    }
}
