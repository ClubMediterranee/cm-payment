import { focusFirstError } from './focusFirstError';

describe('focusFirstError', () => {
  const scrollIntoView = vi.fn();
  const matchMedia = vi.fn();
  let frames: FrameRequestCallback[];

  const nextFrame = () => frames.shift()!(0);

  beforeEach(() => {
    frames = [];
    scrollIntoView.mockClear();
    matchMedia.mockReturnValue({ matches: false });
    Element.prototype.scrollIntoView = scrollIntoView;
    vi.stubGlobal('matchMedia', matchMedia);
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('scrolls a hosted field holding the first error into view on the next frame', () => {
    document.body.innerHTML = `
      <fieldset id="hosted"><span data-testid="FormControlError">Card</span></fieldset>
      <div><input /><span data-testid="FormControlError">Name</span></div>`;

    focusFirstError(document);

    expect(scrollIntoView).not.toHaveBeenCalled();

    nextFrame();

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('hosted'));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });

  it('scrolls instantly when the user prefers reduced motion', () => {
    matchMedia.mockReturnValue({ matches: true });
    document.body.innerHTML =
      '<fieldset><span data-testid="FormControlError">Card</span></fieldset>';

    focusFirstError(document);
    nextFrame();

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'instant', block: 'center' });
  });

  it('leaves the first error of a native field to react-hook-form', () => {
    document.body.innerHTML = `
      <div><input /><span data-testid="FormControlError">Name</span></div>
      <fieldset><span data-testid="FormControlError">Card</span></fieldset>`;

    focusFirstError(document);
    nextFrame();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('only looks for errors inside the given root', () => {
    document.body.innerHTML = `
      <fieldset><span data-testid="FormControlError">Card</span></fieldset>
      <form></form>`;

    focusFirstError(document.querySelector('form')!);
    nextFrame();

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(frames).toHaveLength(0);
  });
});
