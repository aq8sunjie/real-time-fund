# 打包成 Android App 说明

本项目使用 **Capacitor** 将网页打包为 Android 应用，按以下步骤即可生成 APK。

## 环境要求

- Node.js（已安装 npm）
- **Android Studio**（用于构建 APK）
  - 下载：https://developer.android.com/studio
  - 安装时勾选 Android SDK、Android SDK Platform、Android Virtual Device（可选）

## 一、安装依赖并构建网页

在项目根目录执行：

```bash
npm install
npm run build:app
```

- `build:app` 会以「无 basePath」方式构建，产出在 `out/` 目录，供 Capacitor 使用。

## 二、初始化 Capacitor 并添加 Android（仅首次需要）

首次打包时执行：

```bash
npx cap add android
```

若未生成 `android` 目录，可先初始化再添加：

```bash
npx cap init "实时基金估值" "com.realtimefund.app" --web-dir out
npx cap add android
```

## 三、同步网页到 Android 并打开工程

每次修改网页并重新构建后，执行：

```bash
npm run build:app
npx cap sync
```

然后用 Android Studio 打开 Android 工程并打包 APK：

```bash
npx cap open android
```

- 在 Android Studio 中：**Build → Build Bundle(s) / APK(s) → Build APK(s)**，等待完成后在 `android/app/build/outputs/apk/debug/` 下可找到 `app-debug.apk`。
- 需要正式发布时可使用 **Build → Generate Signed Bundle / APK** 打签名包。

## 四、常用命令速查

| 命令 | 说明 |
|------|------|
| `npm run build:app` | 为 App 构建网页（输出到 out/） |
| `npx cap sync` | 将 out/ 同步到 Android 工程 |
| `npx cap open android` | 用默认程序打开 Android 工程（通常是 Android Studio） |

## 五、注意事项

1. **网页构建**：发布到 GitHub Pages 时仍用 `npm run build`；打包 App 时用 `npm run build:app`，二者不要混用。
2. **应用内网络**：App 内仍通过现有接口请求基金数据，需保证设备可访问外网。
3. **应用名称与包名**：在 `capacitor.config.json` 中可修改 `appName`、`appId`，修改后需重新执行 `npx cap sync`。
