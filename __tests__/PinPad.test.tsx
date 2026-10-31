import { fireEvent, render } from '@testing-library/react-native';
import { PinPad } from '../src/components/PinPad';

describe('PinPad', () => {
  it('calls onComplete with the digits once four are entered', () => {
    const onComplete = jest.fn();
    const { getByLabelText } = render(<PinPad onComplete={onComplete} />);
    ['1', '2', '3'].forEach(d => fireEvent.press(getByLabelText(d)));
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.press(getByLabelText('4'));
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('deletes the last digit', () => {
    const onComplete = jest.fn();
    const { getByLabelText } = render(<PinPad onComplete={onComplete} />);
    fireEvent.press(getByLabelText('9'));
    fireEvent.press(getByLabelText('Delete'));
    ['1', '2', '3', '4'].forEach(d => fireEvent.press(getByLabelText(d)));
    expect(onComplete).toHaveBeenCalledWith('1234');
  });
});
