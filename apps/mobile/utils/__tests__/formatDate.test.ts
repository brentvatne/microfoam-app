import { humanDate } from "../formatDate";

describe(humanDate, () => {
  it('returns "Today" if the date is today', () => {
    const today = new Date();
    expect(humanDate(today)).toEqual("Today");
  });
});