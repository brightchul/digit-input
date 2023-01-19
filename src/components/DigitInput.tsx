import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface DigitInputProps {
  defaultValue?: number;
}

const BACK_SPACE = 8;
const DELETE = 46;

export default function DigitInput({ defaultValue = 0 }: DigitInputProps) {
  const [value, setValue] = useState(defaultValue.toLocaleString());
  const [position, setPosition] = useState({ cursor: 0 });

  const currenKeyCode = useRef(0);
  const ref = useRef<null | HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let enteredValue = e.target.value;

      const keyCode = currenKeyCode.current;
      if (36 <= keyCode && keyCode <= 40) return;

      let parsedString = enteredValue.replace(/\D+|^[0]/g, "");

      let nextValue = parsedString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      let currentPosition = e.target.selectionStart as number;

      switch (keyCode) {
        case BACK_SPACE: {
          if (enteredValue.length > nextValue.length) {
            currentPosition = Math.max(0, currentPosition - 1);
          }
          break;
        }
        case DELETE: {
          // continue ,
          if (value.length === nextValue.length) {
            if (nextValue[currentPosition] === ",") currentPosition += 1;
          }
          // decrease ,
          else if (value.length > nextValue.length) {
            const amount = value.length - nextValue.length;
            currentPosition = Math.max(currentPosition - amount + 1, 0);
          }
          // remove ,
          else {
            if (nextValue[currentPosition] === ",") {
              nextValue = (
                nextValue.slice(0, currentPosition) +
                nextValue.slice(currentPosition + 2)
              )
                .replace(/\D+/g, "")
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

              if (value.length === nextValue.length) {
                currentPosition += 1;
              }
            }
          }
          break;
        }

        default: {
          if (isNaN(parseInt(enteredValue[currentPosition - 1], 10))) {
            currentPosition -= 1;
          } else if (
            enteredValue[currentPosition - 1] === "0" &&
            currentPosition === 1
          ) {
            currentPosition -= 1;
          } else {
            if (enteredValue.length < nextValue.length) {
              currentPosition += 1;
            }
          }
        }
      }

      setValue(nextValue);
      setPosition({ cursor: currentPosition });
    },
    [value]
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.setSelectionRange(position.cursor, position.cursor);
    }
  }, [position, ref]);

  return (
    <input
      value={value}
      onChange={handleChange}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        currenKeyCode.current = e.keyCode;
      }}
      ref={ref}
    />
  );
}
