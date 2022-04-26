const scrapPage = async ({ page, data: url }) => {
  try {
    await page.goto(url);

    const ratings = await page.$$eval("div.sc-94726ce4-3>ul>li", (result) =>
      result.map((elem) => elem.innerText)
    );
    const rating = ratings[0] === "TV Series" ? ratings[2] : ratings[1];

    // const votes = await page.$eval(
    //   "span.sc-7ab21ed2-1",
    //   (elem) => elem.innerText
    // );

    const genre = await page.$$eval(
      "div.ipc-chip-list>a.sc-16ede01-3>span",
      (result) => result.map((elem) => elem.innerText).join(",")
    );

    const languages = await page.$$eval(
      "li[data-testid='title-details-languages']>div>ul>li>a",
      (result) => result.map((elem) => elem.innerText).join(",")
    );

    console.log(url, rating, genre, languages);
  } catch (error) {
    console.log(error);
  }
};

module.exports = scrapPage;
