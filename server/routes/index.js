const router = require("koa-router")();
const sql = require("../controllers/mysqlConfig");
const Mail = require("../controllers/Mail");
const request = require("request");
router.get("/get/city", async (ctx, next) => {
  let data = await sql.query("select * from city"); //获取map页的城市列表
  try {
    ctx.body = {
      code: 1,
      data
    };
  } catch {
    error.message = "这个异常我知道，是后端数据库中的脏数据引起的！";
    throw error; // 抛出处理后的异常
  }
});

router.get("/get/swipers", async (ctx, next) => {
  let ql = ctx.query.bigleiid
    ? `select * from lbt where lbt.bigleiid=${ctx.query.bigleiid}`
    : `select * from lbt where bigleiid IS NULL`;
  let data = await sql.query(ql);
  try {
    ctx.body = {
      code: 1,
      data
    };
  } catch {
    error.message = "这个异常我知道，是后端数据库中的脏数据引起的！";
    throw error; // 抛出处理后的异常
  }
});

router.get("/get/icon", async (ctx, next) => {
  //获取icon图标
  let data = await sql.query("select * from biglei where gongneng='首页icon'");
  try {
    ctx.body = {
      code: 1,
      data
    };
  } catch {
    error.message = "这个异常我知道，是后端数据库中的脏数据引起的！";
    throw error; // 抛出处理后的异常
  }
});

router.get("/get/smallei", async (ctx, next) => {
  //获取小类
  let data = await sql.query(
    `select * from smallei where bigleiid=${ctx.query.bigleiid}`
  );
  try {
    ctx.body = {
      code: 1,
      data
    };
  } catch {
    error.message = "这个异常我知道，是后端数据库中的脏数据引起的！";
    throw error; // 抛出处理后的异常
  }
});

router.post("/get/shop", async (ctx, next) => {
  //获取商品
  let ql = ctx.request.body.bigleiid
    ? `select * from shop where shopbigid=${ctx.request.body.bigleiid}`
    : `select * from shop where shopsmalid=${ctx.request.body.smalleiid}`;
  let data = await sql.query(ql);
  try {
    ctx.body = {
      code: 1,
      data
    };
  } catch {
    error.message = "这个异常我知道，是后端数据库中的脏数据引起的！";
    throw error; // 抛出处理后的异常
  }
});

router.post("/get/user", async (ctx, next) => {
  //这个方法有两个功能，一个是当用户输入完账号以后请求数据库，看看用户输入的这个账号是否存在，一个是判断用户输入的验证码与本地存储的是否一致，一致返回用户信息
  try {
    //因为我有三种登录方式，手机验证码，邮箱验证码，账号密码
    let data = "";
    if (ctx.request.body.flex == "phone") {
      //这里判断的用户正在进行的是否是手机验证登录，“phone”是前台传来的
      if (ctx.request.body.isdl == true) {
        //判断用户当前点击的是登陆按钮还是在检测他的账户是否存在，如果isdl是true证明用户正在点击登录按钮
        if (ctx.request.body.yzm == ctx.cookies.get("yzm")) {
          //判断用户输入的验证码与本地保存的验证码是否一致
          data = await sql.query(
            //一致获取用户信息
            `select * from register where username='${ctx.request.body.username}'`
          );
          ctx.body = {
            code: 1,
            data
          };
        } else {
          ctx.body = {
            code: 0,
            data: "您输入的验证码不正确"
          };
        }
      } else {
        //这里就是在检测用户的账号是否存在
        data = await sql.query(
          `select * from register where username='${ctx.request.body.username}'`
        );
        ctx.body = {
          code: 1,
          data
        };
      } //以下的两种登录方式都是按照上面的那种方式进行判断的
    } else if (ctx.request.body.flex == "youxiang") {
      if (ctx.request.body.isdl == true) {
        if (ctx.request.body.yzm == ctx.cookies.get("yzm")) {
          data = await sql.query(
            `select * from register where email='${ctx.request.body.mail}'`
          );
          ctx.body = {
            code: 1,
            data
          };
        } else {
          ctx.body = {
            code: 0,
            data: "您输入的验证码不正确"
          };
        }
      } else {
        data = await sql.query(
          `select * from register where email='${ctx.request.body.username}'`
        );
        ctx.body = {
          code: 1,
          data
        };
      }
    } else {
      if (!ctx.request.body.isdl) {
        data = await sql.query(
          `select * from register where username='${ctx.request.body.username}'`
        );
        ctx.body = {
          code: 1,
          data
        };
      } else {
        console.log(ctx.request.body.phone, ctx.request.body.yzm, "...");
        data = await sql.query(
          `select * from register where username='${ctx.request.body.phone}' and password='${ctx.request.body.yzm}'`
        );
        ctx.body = {
          code: 1,
          data
        };
      }
    }
  } catch {
    ctx.status = 404;
    ctx.body = "这个异常我知道，是后端数据库中的脏数据引起的！";
  }
});

router.post("/add/car", async (ctx, next) => {
  //给用户添加购物车
  let obj = ctx.request.body;
  console.log(obj, "obobooooj");

  try {
    let data = await sql.query(
      `INSERT INTO registershop (shopid,shopname,shopicon,shopsmalid,shopprice,shopnum,shopcont,shopchecked,shopbigid,shopflex,shopzhekou,shopyouhuiquan,shopuserid) VALUES ('${obj.shopid}','${obj.shopname}','${obj.shopicon}','${obj.shopsmalid}','${obj.shopprice}','${obj.shopnum}','${obj.shopcont}','${obj.shopchecked}','${obj.shopbigid}','${obj.shopflex}','${obj.shopzhekou}','${obj.shopyouhuiquan}','${obj.shopuserid}')`
    );
    ctx.body = {
      code: 1,
      data
    };
  } catch {
    ctx.status = 404;
    ctx.body = "这个异常我知道，是后端数据库中的脏数据引起的！";
  }
});

router.post("/get/yzm", async (ctx, next) => {
  //生成验证码
  try {
    let yzm = "";
    for (var i = 0; i < 6; i++) {
      yzm += Math.floor(Math.random() * 10);
    }

    if (ctx.request.body.flex == "phone") {
      ctx.cookies.set("yzm", yzm);
      let account = "C14151255";
      let password = "237861450d60ef9a4e5aa7789e20f339";
      let mobile = ctx.request.body.phone;
      let content = `您的验证码是：${yzm}。请不要把验证码泄露给其他人。`;
      request.post(
        {
          url: "https://106.ihuyi.com/webservice/sms.php?method=Submit",
          form: { account, password, mobile, content }
        },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            ctx.body = {
              code: 1,
              body
            };
          }
        }
      );
    } else if (ctx.request.body.flex == "youxiang") {
      ctx.cookies.set("yzm", yzm);
      Mail.send(ctx.request.body.mail, yzm)
        .then(() => {
          ctx.body = { err: 0, msg: "验证码发送 ok" };
        })
        .catch(() => {
          ctx.body = { err: -1, msg: "验证码发送 not ok" };
        });
    }
  } catch {
    ctx.status = 404;
    ctx.body = "这个异常我知道，是后端数据库中的脏数据引起的！";
  }
});

router.post("/find/password", async (ctx, next) => {
  //qq邮箱找回密码发送验证码
  try {
    let yzm = "";
    for (var i = 0; i < 6; i++) {
      yzm += Math.floor(Math.random() * 10);
    }
    ctx.cookies.set("yzm", yzm); //在本地的cookies里面存一份验证码
    let data = await Mail.send(ctx.request.body.mail, yzm); //给用户发一份
    ctx.body = {
      code: 1,
      data
    };
  } catch {
    ctx.status = 404;
    ctx.body = "这个异常我知道，是后端数据库中的脏数据引起的！";
  }
});

router.post("/get/password", async (ctx, next) => {
  //获得密码
  try {
    if (ctx.request.body.yzm == ctx.cookies.get("yzm")) {
      //当用户点击确定按钮时把用户输入的验证码传回来与本地的进行比较，比较成功登录成功返回密码
      let data = await sql.query(
        `select * from register where email='${ctx.request.body.mail}'`
      );
      let password = data[0].password;
      ctx.body = {
        code: 1,
        password
      };
    } else {
      ctx.body = {
        code: 0,
        password: "您输入的验证码不正确"
      };
    }
  } catch {
    ctx.status = 404;
    ctx.body = "这个异常我知道，是后端数据库中的脏数据引起的！";
  }
});

module.exports = router;
