var router = require('koa-router')();
const cheerio = require('cheerio')
const userModel = require('../lib/mysql')
const cralwer = require('../util/cralwer')


function decodeSightDetail(res){
    let $ = cheerio.load(res.text);
  // console.log($('.introduce-content').text())
   //console.log($('.traffic-content').text())
    let imgs = [];
    $('.introduce-content').find('img').each(i => {
        imgs.push($('.introduce-content').find('img').eq(i).attr('src'))
    })
    const result = {
        bright: $('.introduce-feature').text(),
        description: $('.toggle_l').eq(0).text(),
        detailcon: $('.toggle_l').eq(1).text(),
        s_sight_addr: $('span[data-reactid=45]').text(),
        s_sight_in_list: $('.time').text(),
        img: imgs,
        traffic: $('.traffic-content').text()
    }
    return result;
}
function decodeSightDetail2(res){
    let $ = cheerio.load(res.text);
    let imgs = [];
     $('.carousel-inner img').each(i => {
        imgs.push($('.carousel-inner img').eq(i).attr('src'))
    })
    const result = {
        bright: $('.bright_spot li').text(),
        description: $('.toggle_l').eq(0).text(),
        detailcon: $('.toggle_l').eq(1).text(),
        s_sight_addr: $('.s_sight_addr').text(),
        s_sight_in_list: $('dl.s_sight_in_list').text(),
        img: imgs
    }
    return result;
}


function decode2(res){
    let $ = cheerio.load(res.text);
    return {
        'traffic': $('.detailcon div').text()
    }
}

function decodeFoodDetail(res){
    let $ = cheerio.load(res.text);
    let imgs = [];
     $('.carousel-inner img').each(i => {
        imgs.push($('.carousel-inner img').eq(i).attr('src'))
    })
    const result = {
        bright: $('.detailcon').eq(0).find('div').eq(1).text(),
        description: $('.detailcon').eq(0).find('div').eq(0).text(),
        detailcon: '',
        s_sight_addr: $('.s_sight_in_list').find('li').eq(3).text(),
        s_sight_in_list: $('.s_sight_in_list').find('li').eq(4).text(),
        traffic: $('.detailcon').eq(2).find('div.text_style').eq(0).text(),
        img: imgs
    }
    
    return result;
}

function decodeShoppingDetail(res){
    let $ = cheerio.load(res.text);
    let imgs = [];
     $('.carousel-inner img').each(i => {
        imgs.push($('.carousel-inner img').eq(i).attr('src'))
    })
    const result = {
        bright: '',
        description: $('.toggle_l').eq(0).text(),
        detailcon: '',
        s_sight_addr: $('ul.s_sight_in_list li').eq(0).text(),
        s_sight_in_list: $('dl.s_sight_in_list').text(),
        traffic: $('.toggle_s').eq(1).find('.text_style').eq(0).text(),
        img: imgs
    }
    return result;
}

router.get('/getSightDetail',async(ctx,next) => {
    let str = ctx.request.querystring.split("&");
    let url = decodeURIComponent(str[0].substr(4));
    let type = decodeURIComponent(str[1].substr(5));
  
    let decode;
    let json;
    if(type==0){
        // url = ctx.request.querystring.split('=')[1];
        if(ctx.request.query.flag==1){
            decode = decodeSightDetail
           // await Promise.all([cralwer.fetUrl(url,decode),cralwer.fetUrl(url2,decode2)])
              await cralwer.fetUrl(url,decode)
                .then(res => {
                    if(res!=0){
                      
                          //  res[0]['traffic'] = res[1].traffic
                        ctx.body = {
                            statusCode: 1,
                            msg: 'success',
                            data: res
                          }
                    }else{
                        ctx.body = {
                            statusCode: 0,
                            msg: '查询信息失败',
                            data: ''
                          }
                    }
                }).catch(err => {
                    ctx.body = {
                        statusCode: 2,
                        msg: '服务器出错',
                        data: ''
                      }
                      console.error(err)
                })
        }else{
            const url2 = url.replace('.html','-traffic.html')
            decode = decodeSightDetail2
            await Promise.all([cralwer.fetUrl(url,decode),cralwer.fetUrl(url2,decode2)])
                .then(res => {
                    if(res.length>0){
                      
                            res[0]['traffic'] = res[1].traffic
                        ctx.body = {
                            statusCode: 1,
                            msg: 'success',
                            data: res[0]
                          }
                    }else{
                        ctx.body = {
                            statusCode: 0,
                            msg: '查询信息失败',
                            data: ''
                          }
                    }
                }).catch(err => {
                    ctx.body = {
                        statusCode: 2,
                        msg: '服务器出错',
                        data: ''
                      }
                      console.error(err)
                })
        }
   
    }else{
        decode = type==2 ? decodeFoodDetail : decodeShoppingDetail
        url = 'https://you.ctrip.com' + url;
        await cralwer.fetUrl(url,decode)
        .then(res => {
            console.log('res',res==0)
            if(res!=0){
                ctx.body = {
                    statusCode: 1,
                    msg: 'success',
                    data: res
                  }
            }else{
                ctx.body = {
                    statusCode: 0,
                    msg: '查询信息失败',
                    data: ''
                  }
            }
        }).catch(err => {
            ctx.body = {
                statusCode: 2,
                msg: '服务器出错',
                data: ''
              }
              console.error(err)
        })
    } 
    
})

module.exports = router