# 喵界神颜鉴定所

鹿卷公寓的中文猫咪娱乐美学网站。提供本地图片预览与压缩、六维 AI 趣味解读、称号、双猫点评、PNG 晒猫卡和复制文案。无第三方运行依赖，Node.js 20+。

## 本地体验

在本目录运行 `npm start`，访问 http://localhost:9000 。无密钥即可体验示例和卡片；真实分析默认关闭。运行 `npm test` 与 `npm run check` 验证服务。

## 已完成与待连接

前后端与 GitHub Pages 工作流已提供。真实 API 联调、函数计算上传、GitHub 推送和线上验证，仍需用户账号及仓库授权；不得将本交付描述为已经上线。示例为预写文本，页面明确标记；不会假装分析照片。

## 模型选择与注册

推荐阿里云百炼 `qwen3-vl-plus`：官方视觉模型目录列有该模型，支持图片描述和视觉问答，适合可见细节的中文娱乐解读；本推荐不是猫咪测评效果基准结论。

1. 打开 https://bailian.console.aliyun.com/ ，注册或登录阿里云账号，按控制台要求完成实名认证、开通百炼。
2. 选择华北2（北京），在模型广场确认 `qwen3-vl-plus` 可用；先在控制台用一张有权使用的猫片试验效果。查看当前价格、免费额度与预算，不假定永久免费。
3. 进入 API Key 页面，创建本项目专用 Key，尽可能限制可调用模型。地域与接入地址必须匹配。
4. Key 仅粘贴到函数计算的 `DASHSCOPE_API_KEY` 环境变量，不发到聊天，不放 GitHub Secrets 以外的构建配置，更不要放前端。此项目也不需要把 Key 放 GitHub Secrets。
5. 北京兼容地址可使用 `https://dashscope.aliyuncs.com/compatible-mode/v1`；如果控制台给出业务空间专属地址，把它设置为 `DASHSCOPE_BASE_URL`，不要自行猜空间 ID。

官方依据：
- https://help.aliyun.com/zh/model-studio/get-api-key
- https://help.aliyun.com/zh/model-studio/vision
- https://docs.bailian.console.aliyun.com/zh/model-studio/model-list-visual-understanding
- https://help.aliyun.com/zh/model-studio/model-pricing

## 部署架构

浏览器 → GitHub Pages 静态页面 → 阿里云函数计算 HTTPS `/api/analyze` → 百炼。

GitHub Pages 仅支持静态托管，无法安全保存或使用模型密钥。工作流仅发布 `public/`，不会发布后端、测试、环境变量。官方说明：https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

### 阿里云函数计算

1. 同一阿里云账号开通函数计算，在北京创建 Web 函数，选择支持 Node.js 20+ 的自定义运行环境。上传本项目代码（ZIP 根目录直接含 `server.mjs`，不要多套一层目录）。不需要安装依赖。
2. 启动命令 `node server.mjs`，工作目录为代码根目录，监听端口 9000，超时至少 60 秒。服务监听 `0.0.0.0`。若使用环境未包含 Node，请先在运行环境/公共层中添加 Node.js 20+。
3. 在函数配置环境变量设置 `DASHSCOPE_API_KEY`、`VISION_MODEL=qwen3-vl-plus`、`ALLOWED_ORIGIN=https://你的账号.github.io`、随机且不公开的 `ACCESS_CODE`，可选设置 `DASHSCOPE_BASE_URL`。ALLOWED_ORIGIN 不带仓库路径与尾斜杠。
4. 配置 HTTPS HTTP 触发器供前端调用，应用层邀请码控制内测。不要将云账号凭据作为前端鉴权。若云平台拦截 OPTIONS，需为准确的前端来源允许 POST/OPTIONS、Content-Type 和 X-Access-Code，勿用通配来源。用浏览器实测跨域后再开放。
5. 在 `public/config.js` 的 `apiBase` 填写函数 HTTPS 根地址，不含 `/api/analyze`、不含 Key。HTTP 触发器应保留请求路径。
6. 当前限流为单进程每分钟 5 次、日 100 次、并发 2 次。实例重启会重置，多实例不共享计数。因此函数应先设最大实例数 1 并配置平台调用配额、预算与费用告警；面向公众前必须改用共享持久化限额和验证码/用户身份验证。邀请码只是小范围内测方案。
7. 本站不主动保存照片，不打印请求或模型内容。关闭函数请求体采集及日志回流；云平台和模型服务仍可能按协议处理数据，须向用户如实披露。配置云费用告警不能等同硬预算上限。

官方配置说明：https://www.alibabacloud.com/help/zh/functioncompute/creating-a-web-function 和 https://help.aliyun.com/zh/functioncompute/principles-1

### GitHub Pages

1. 在当前 GitHub 账号新建 `miao-beauty-lab`（如使用免费 Pages，通常需公开仓库），为已连接 GitHub 应用授权该仓库，并提供链接。
2. 将本目录源文件提交到仓库 `main`。仓库 Settings → Pages → Source 选择 GitHub Actions。
3. 已附 `.github/workflows/pages.yml`：先跑后端测试，再仅发布 `public/`。不需要构建或 npm install。
4. 配置函数 URL 后再次推送。期望地址为 `https://账号.github.io/miao-beauty-lab/`，需以 Actions 实际发布结果为准。
5. 上线后核实：示例标记、手机上传、邀请错误、非猫/多猫反馈、真实模型调用、PNG 下载、复制、跨域、限流、预算配置。当前未完成真实云端联调。

## 安全与产品边界

图片重绘为 JPEG，最长边 1280，不沿用原图 EXIF。浏览器最大原图 10 MB、后端请求约 2.6 MB；后端不接受远程图片 URL，避免由用户指定 URL 发起请求。输出经过字段和范围校验，文本用 textContent 渲染。上游错误不返回原文，防止信息泄露。

六项分数取 80–99 的正向趣味值，总分为算术平均，不是科学标准、百分位或权威排名。AI 可能误读细节。称号、幽默联想均属娱乐；不推断健康、血统或真实性格。

当前无鹿鹿卷卷参考照片，仅采用角色语气：鹿鹿讲究秩序、卷卷热情古灵精怪。页面装饰不代表真实角色外观。字体有系统回退，外部字体不可用不影响功能。
