var router = require('koa-router')();
const cheerio = require('cheerio')
const userModel = require('../lib/mysql')
const cralwer = require('../util/cralwer')

function decodeSight(res){
  let result = []
  let $ = cheerio.load(res.text)

const img = $('.list_wide_mod2').find('.leftimg img');
const name = $('.list_wide_mod2').find('.rdetailbox dt a');
const description = $('.list_wide_mod2').find('.rdetailbox .ellipsis');
const comment = $('.list_wide_mod2').find('.rdetailbox .recomment');
for(let i = 0,len = img.length;i<len;i++){
  //console.log($('.rdetailbox').eq(i).find('dd').eq(1).text().length)
  let obj = {
    src: img[i].attribs.src,
    href: `https://you.ctrip.com${name[i].attribs.href}`,
    title: name[i].attribs.title,
    description: description[i].children[0].data.replace('\n',''),
    comment: comment[i].children[0].data.replace(/\n\s+/g,''),
    flag: $('.rdetailbox').eq(i).find('dd').eq(1).text().length==54 ? 0:1
  }
  result.push(obj)
}
return result;
}

function decodeRestaurant(res){
  let result = []
  let $ = cheerio.load(res.text)
  const list = $('.list_wide_mod2 .list_mod2')

  for(let i = 0,len = list.length;i<len;i++){
    let item = list.eq(i)
    let obj = {
      src: item.find('img').attr('data-imgurl'),
      title: item.find('.rdetailbox a').eq(0).text(),
      description: item.find('.ellipsis').eq(0).text(),
      href: item.find('.rdetailbox a').eq(0).attr('href')
    }
    result.push(obj)
  }
 // console.log(result)
  return result;
}

async function decodeShopping(res){
  let result = []
  let $ = cheerio.load(res.text)
  /* const list = $('.in_card li')

  for(let i = 0,len = list.length;i<len;i++){
    let item = list.eq(i)
    let obj = {
      src: item.find('img').attr('writing'),
      title: item.find('.ellipsis').eq(0).text(),
      description: item.find('.ellipsis').eq(1).text(),
      href: item.find('.all_link').attr('href')
    } */
    const list = $('.list_wide_mod2 .list_mod2')

    for(let i = 0,len = list.length;i<len;i++){
      let item = list.eq(i)
      let obj = {
        src: item.find('img').attr('writing'),
        title: item.find('.rdetailbox').eq(0).find('a').eq(0).text(),
        description: item.find('.ellipsis').eq(0).text(),
        href: item.find('.rdetailbox').eq(0).find('a').eq(0).attr('href')
      }
    result.push(obj)
  }
  //console.log(result)
  let sid = '';
  result.forEach(i => {
    sid += "," + i.src
  })
  const data = { "writing": sid, "width": 270, "height": 170 }
  const url = 'https://you.ctrip.com/destinationsite/SharedPage/GetTravelPhoto'
  let srcs =await cralwer.fetUrl2(url,data)
   srcs = JSON.parse(srcs)
  srcs.forEach((item,i) => {
    result[i].src = item.ImgageUrl 
  }) 
  return result;
}
  

router.get('/getSightList', async(ctx, next) => {
    let str = ctx.request.querystring.split("&");
    let name = decodeURIComponent(str[0].substr(5));
    let type = decodeURIComponent(str[1].substr(4));
    let page = ctx.request.query.page ? ctx.request.query.page : 1;
    console.log(type)
    await userModel.findCityId(name)
        .then(res => {
          let url = '', decode;
          if(type=='全部'||type=='景点'){ //景点
             url = `https://you.ctrip.com/sight/${res[0].num}/s0-p${page}.html`;
             decode = decodeSight
             
          }else if(type=='购物'){   //购物
             url = `https://you.ctrip.com/shoppinglist/${res[0].num}/s0-p${page}.html`;
             decode = decodeShopping
          }else{    //美食
            url =  `https://you.ctrip.com/restaurantlist/${res[0].num}/s0-p${page}.html`;
            decode = decodeRestaurant
          }
          return cralwer.fetUrl(url,decode)
           })
           .then(result => {
              // console.log('res------',result)
            if(result&&result.length>0){
             ctx.body = {
               statusCode: 1,
               msg: 'success',
               data: result
             }
            // console.log(result)
           }else{
             ctx.body = {
               statusCode: 0,
               msg: '查无该地区景点信息',
               data: []
             }
           }
        })
         .catch(err =>{
          ctx.body = {
            statusCode: 0,
            msg: '数据库查询失败',
            data: []
          }
          console.log('err: ',err)
        })


})

module.exports = router