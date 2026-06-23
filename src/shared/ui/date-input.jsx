import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const padDatePart = (value) => String(value).padStart(2, '0');
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toDateInputValue = (value) => {
  if (!value) return '';

  const normalizedValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(normalizedValue)) {
    return normalizedValue.split('T')[0];
  }

  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) return '';

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join('-');
};

const formatDateInputDisplay = (value) => {
  const normalizedValue = toDateInputValue(value);

  if (!normalizedValue) return '';

  const [year, month, day] = normalizedValue.split('-');
  return `${day}/${month}/${year}`;
};

const parseDateInputDisplay = (value) => {
  const match = String(value)
    .trim()
    .match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (!match) return '';

  const [, dayValue, monthValue, yearValue] = match;
  const day = Number(dayValue);
  const month = Number(monthValue);
  const year = Number(yearValue);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return '';
  }

  return `${yearValue}-${padDatePart(month)}-${padDatePart(day)}`;
};

const toLocalDate = (value) => {
  const normalizedValue = toDateInputValue(value);

  if (!normalizedValue) return new Date();

  const [year, month, day] = normalizedValue.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getCalendarDays = (visibleMonth) => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingDays = firstDay.getDay();
  const days = [];

  for (let index = 0; index < leadingDays; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
};

const getMonthLabel = (value) =>
  value.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

const DateInput = ({ label, value, onChange, error, required, ...props }) => {
  const wrapperRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(() =>
    formatDateInputDisplay(value)
  );
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => toLocalDate(value));
  const selectedValue = toDateInputValue(value);

  const emitChange = (nextValue) => {
    onChange?.({
      target: {
        name: props.name,
        value: nextValue,
      },
    });
  };

  useEffect(() => {
    setDisplayValue(formatDateInputDisplay(value));
    setVisibleMonth(toLocalDate(value));
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  const handleChange = (event) => {
    const nextDisplayValue = event.target.value;
    const parsedValue = parseDateInputDisplay(nextDisplayValue);

    setDisplayValue(nextDisplayValue);
    emitChange(nextDisplayValue.trim() ? parsedValue : '');
  };

  const getTodayValue = () => {
    const today = new Date();
    return [today.getFullYear(), padDatePart(today.getMonth() + 1), padDatePart(today.getDate())].join('-');
  };

  const handleSelectDate = (date) => {
    const nextValue = [
      date.getFullYear(),
      padDatePart(date.getMonth() + 1),
      padDatePart(date.getDate()),
    ].join('-');

    setDisplayValue(formatDateInputDisplay(nextValue));
    emitChange(nextValue);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const todayValue = getTodayValue();
    setDisplayValue(formatDateInputDisplay(todayValue));
    emitChange(todayValue);
    setVisibleMonth(toLocalDate(todayValue));
    setIsOpen(false);
  };

  const moveMonth = (amount) => {
    setVisibleMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + amount, 1)
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label ? (
        <label className="mb-1 block font-medium text-gray-700">
          {label}
          {required ? <span className="text-red-500 mr-1"> *</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <input
          {...props}
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/yyyy"
          value={displayValue}
          onChange={handleChange}
          className={`w-full rounded-lg border px-4 py-2 pl-11 transition focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-400 focus:ring-red-200'
              : 'border-gray-200 focus:border-primary focus:ring-primary/20'
          } ${props.className || ''}`}
        />

        <button
          type="button"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-primary"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open calendar"
        >
          <Calendar size={18} />
        </button>
      </div>

      {isOpen ? (
        <div className="absolute z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              onClick={() => moveMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm font-semibold text-gray-800">
              {getMonthLabel(visibleMonth)}
            </span>

            <button
              type="button"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              onClick={() => moveMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
            {WEEK_DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {getCalendarDays(visibleMonth).map((date, index) => {
              const dateValue = date ? toDateInputValue(date) : '';
              const isSelected = dateValue && dateValue === selectedValue;

              return date ? (
                <button
                  key={dateValue}
                  type="button"
                  className={`h-9 rounded-lg text-sm transition ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
                  }`}
                  onClick={() => handleSelectDate(date)}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span key={`empty-${index}`} />
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleSelectToday}
            className="mt-3 w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm text-primary transition hover:bg-primary/10"
          >
            اليوم
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

export default DateInput;
