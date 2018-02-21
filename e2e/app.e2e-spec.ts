import { AppPage } from './app.po';

describe('kyber-poc App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display app title', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('kyber poc');
  });
});
