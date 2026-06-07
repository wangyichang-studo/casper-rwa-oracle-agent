# 如何录制Demo视频

## 你需要做的（3步，5分钟）

### 第1步：打开终端

- 打开 Terminal.app（Mac）。
- 进入项目目录：`cd /Users/wangyichang/Documents/黑客松`。
- 建议把终端字体调大一点（Cmd + 加号键放大3次）。

### 第2步：开始录屏

- Mac: 按 `Cmd + Shift + 5`。
- 选择“录制整个屏幕”或“录制所选区域”（建议选终端窗口）。
- 点击“录制”按钮。

### 第3步：运行演示

```bash
./scripts/demo.sh
```

等待脚本自动运行完毕，约2-3分钟。脚本结束后，停止录屏（点击菜单栏的停止按钮）。

### 第4步：上传视频

- 视频文件通常保存在桌面。
- 上传到 YouTube，设为 “Unlisted / 不公开” 即可。
- 复制视频链接，用于 DoraHacks 提交。

## 自动渲染备选方案

Codex 也可以运行：

```bash
./scripts/render-demo-video.sh
```

它会把 `scripts/demo.sh --plain --fast` 的输出渲染成一个终端风格 MP4，适合快速预览和备用提交。
