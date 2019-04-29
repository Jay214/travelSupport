const router = require('koa-router')()
const cheerio = require('cheerio')
const userModel = require('../lib/mysql')
const cralwer = require('../util/cralwer')
let arr =['景点','购物','美食','游记','攻略']

/* findAllPost
//查询文章
let findAllPost = (name,type) => {
    let _sql = `select * from posts where address like'%${name}%' and type=${type}`
    return query(_sql)
}
//根据类型和标签查询文章
let findPostWithTag = (name,type,tag) => {
    let _sql = `select * from posts where address like'%${name}%' and type=${type} and tag like'%${tag}%'`
    return query(_sql)
}
let findPostsByCity = (address) => {
    let _sql = `select * from posts where address like'%${address}%'`
    return query(_sql)
}
let findQuestionByCity = (address) => {
    let _sql = `select * from question where address like'%${address}%'`
    return query(_sql)
}
let findPostByCityAndTag = (address,tag) => {
    let _sql = `select * from question where address like'%${address}%' and tag like'%${tag}%'`
    return query(_sql)
    1景点。。。
    2文章
    3问题
}
 */  
router.get('/search', async(ctx,next) => {
    const {name, val} = ctx.request.query;
    let tag = arr.indexOf(val);
    const data = {}
    try {
      data.sight = []
        if(tag>-1&&tag<3){
        await userModel.findCityId(name)
        .then(res => {
          let url = '', decode;
          if(val=='景点'){ //景点
             url = `https://you.ctrip.com/sight/${res[0].num}.html`;
             decode = decodeSight
             
          }else if(val=='购物'){   //购物
             url = `https://you.ctrip.com/shopping/${res[0].num}.html`;
             decode = decodeShopping
          }else{    //美食
            url =  `https://you.ctrip.com/restaurant/${res[0].num}.html`;
            decode = decodeRestaurant
          }
          return cralwer.fetUrl(url,decode)
           })
           .then(result => {
            if(result&&result.length>0){
                data.sight = result;
           }
        })
        }
        else if(arr.lastIndexOf(val)>2){
            const type = val=='游记'?0:1
            await userModel.findAllPost(name,type)
                .then(res => {
                  res.forEach(i => { i.tag = i.tag.split(',') })
                    data.posts = res;
                })
        }else{
          /*   await userModel.findPostWithTag(name,val,val)
                .then(res => {
                    data.posts = res;
                }) */
           /*  if(data.posts.length<=0){ */
            await userModel.findPostByCityAndTag(name,val)
                .then(res => {
                    res.forEach(i => { i.tag = i.tag.split(',') })
                    data.posts = res
                })
           // }

            await userModel.findQuestionByTag(name,val)
                .then(res => {
                  res.forEach(i => { i.tag = i.tag.split(',') })
                    data.questions = res
                })
            await userModel.findPostsByName(name,val)
                .then(res => {
                  res.forEach(i => { i.tag = i.tag.split(',') })
                    data.posts = data.posts.concat(res)
                })
            await userModel.findQuestionByName(name,val)
                .then(res => {
                  res.forEach(i => { i.tag = i.tag.split(',') })
                    data.questions = data.questions.concat(res)
                })
        }

        ctx.body = {
            data: data,
            msg: '查询成功'
        }

    } catch (error) {
        console.error('err: ',error)
        ctx.response.status = 500
        ctx.body = {
            data:0,
            msg: '查询失败'
        }
    }
   
})


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
    const list = $('.in_card li')
  
    for(let i = 0,len = list.length;i<len;i++){
      let item = list.eq(i)
      let obj = {
        src: item.find('img').attr('data-imgurl'),
        title: item.find('.ellipsis').eq(0).text(),
        description: item.find('.ellipsis').eq(1).text(),
        href: item.find('.all_link').attr('href')
      }
      result.push(obj)
    }
   // console.log(result)
    return result;
  }
  
  async function decodeShopping(res){
    let result = []
    let $ = cheerio.load(res.text)
    const list = $('.in_card li')
  
    for(let i = 0,len = list.length;i<len;i++){
      let item = list.eq(i)
      let obj = {
        src: item.find('img').attr('writing'),
        title: item.find('.ellipsis').eq(0).text(),
        description: item.find('.ellipsis').eq(1).text(),
        href: item.find('.all_link').attr('href')
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
    
module.exports = router

//[6, 4, -3, 5, -2, -1, 0, 1, -9]
