import { Dataset, KeyValueStore, createPuppeteerRouter } from 'crawlee';
import { selectors } from './selectors.js';
import { FirebaseHandler } from './firebase.js';
import fs from 'fs'

export const router = createPuppeteerRouter();

router.addDefaultHandler(async ({ log, page, enqueueLinks }) => {
    log.info(`enqueueing new URLs`);
    const title = await page.title()
    log.info(title)

    /*     const names = await page.evaluate(()=>{
            const list =[]
            document.querySelectorAll('#l-searchResults > div > div > div > div > div.propertyCard-content > div.propertyCard-section > div.propertyCard-details > a > address').forEach(el => list.push(el.textContent))
            return list 
        }) */

    // log.info(names.join(", "))
    await enqueueLinks({
        globs: ["https://www.rightmove.co.uk/properties/*([0-9])#/?channel*"],
        label: "detail"
    })



});


router.addHandler('detail', async ({ request, page, log }) => {
    const page_title = await page.title();
    log.info(`${page_title}`, { url: request.loadedUrl });
    const url = new URL(page.url())
    const id = `${url.host}#${url.pathname.split('/')[2]}`
    const property_url = url.origin + url.pathname

    const title = await page.$eval(selectors.title, el => el.textContent)
        .catch(() => null)

    const price = await page.$eval(selectors.price, el => el.textContent)
        .catch(() => null)

    const date = await page.$eval(selectors.date, el => el.textContent)
        .then(result => result?.match(/(\d{2}\/){2}(\d{4})/)![0])
        .catch(() => null)

    const type = await page.$eval(selectors.type, el => el.textContent)
        .catch(() => null)

    const bathroom = await page.$eval(selectors.bathroom, el => el.textContent)
        .then(result => result?.match(/(\d)+/)![0])
        .catch(() => null)

    const bedroom = await page.$eval(selectors.bedroom, el => el.textContent)
        .then(result => result?.match(/(\d)+/)![0])
        .catch(() => null)

    const tenure = await page.$eval(selectors.tenure, el => el.textContent)
        .catch(() => null)
    const agent = await page.$eval(selectors.agent, el => el.textContent)
        .catch(() => null)
    const address = await page.$eval(selectors.address, el => el.textContent)
        .then(result => result!.replace(/\s+/g, ' ').trim())
        .catch(() => null)
    const description = await page.$eval(selectors.description, el => el.textContent)
        .then(result => result!.replace(/\s+/g, ' ').trim())
        .catch(() => null)
    const features = await page.$$eval(selectors.features, els => {
        const list: Array<string> = []
        els.forEach((el) => list.push(el.textContent!))
        return list
    })
        .catch(() => null)
    const floorplan = await page.$$eval(selectors.floorplan, els => {
        const duck: Array<string> = []
        els.forEach((el) => duck.push(el.getAttribute("href")!))
        return duck
    })
        .then((results) => {
            return results.map((result) => property_url + result)
        })
        .catch(() => null)
    const pictures = await page.$$eval(selectors.pictures, els => {
        const goose: Array<string> = []
        els.forEach((el) => goose.push(el.getAttribute("href")!))
        return goose
    })
        .then((results) => {
            return results.map((result) => property_url + result)
        })
        .catch(() => null)
    const coordinnates = await page.$eval(selectors.coordinnates, el => el.getAttribute("src"))
        .then(result => {
            const link = new URL(result!)
            return [
                link.searchParams.get("latitude"),
                link.searchParams.get("longitude")

            ]
        })
        .catch(() => null)
    const postcodes = await page.evaluate(() => {
        const page_window = window as typeof window & {
            PAGE_MODEL: {
                propertyData: {
                    address: {
                        outcode: string,
                        incode: string
                    }
                }
            }
        }
        return [
            page_window.PAGE_MODEL!.propertyData.address.outcode,
            page_window.PAGE_MODEL!.propertyData.address.incode
        ]
    })
        .catch(() => null)

    const data = {
        url: url.href,
        title,
        price,
        date,
        type,
        bathroom,
        tenure,
        agent,
        address,
        bedroom,
        description,
        features,
        floorplan,
        pictures,
        coordinnates,
        postcodes
    }

    const content = await KeyValueStore.getValue<Array<typeof data>>('properties')
    await KeyValueStore.setValue('properties', [...content!, data])

    await Dataset.pushData(data);

    const firebaseOptions = JSON.parse(fs.readFileSync("./firebase.config.json").toString())
    const store = new FirebaseHandler(firebaseOptions)
    await store.push(data, `properties/${id}`)

});
