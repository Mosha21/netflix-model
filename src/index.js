const { Cluster } = require("puppeteer-cluster");
const csvToJson = require("convert-csv-to-json");

(async () => {
  let fileInputName = "./data/joined_data.csv";

  const data = csvToJson.fieldDelimiter("\\").getJsonFromCsv(fileInputName);

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 10,
    workerCreationDelay: 500,
  });

  const links = [];

  await cluster.task(async ({ page, data: url }) => {
    try {
      await page.goto(url);
      const test = await page.$$eval(
        "table.findList>tbody>tr.findResult>td.result_text>a",
        (result) => result.map((value) => value.href)
      );

      links.push(test[0]);
    } catch (error) {
      console.log(error);
    }
  });

  let counter = 0;
  const promises = [];
  for (title of data) {
    counter++;
    const date = title.releasedate ? title.releasedate : "";
    if (!title.imdblink) {
      promises.push(
        cluster.execute(`https://www.imdb.com/find?q=${title.title} ${date}`)
      );
    } else {
      links.push(title.imdblink);
    }
    console.log(counter);
    if (counter % 10 === 0) break;
  }

  await Promise.all(promises);
  console.log(links);

  await cluster.idle();
  await cluster.close();
})();
