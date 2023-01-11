---
title: Volantis主题自定义 - 暗黑模式按钮随模式改变内容
author: Leo
mathjax: false
date: 2023-01-10 19:24:25
tags:
  - hexo
  - Volantis
  - Javascript
  - 技术
---

在这篇文章中，我将介绍如何让切换深色/浅色模式的按钮的提示文字随颜色模式而变化。

<!-- more -->

## 关于暗黑模式
在主题 Volantis 中，暗黑模式通过以下方式来启动：

```yaml
# 启用 darkmode 插件
plugins:
  darkmode:
    enabled: true

# 在导航栏添加按钮
navbar:
  menu:
    ...
    - name: 深色模式 # 可自定义
      icon: fas fa-moon # 可自定义
      toggle: darkmode
```

这样，你就能得到一个这样的按钮：
```html
<li>
  <a class="menuitem flat-box header toggle-mode-btn">
    <i class="fas fa-moon fa-fw"></i>深色模式
  </a>
</li>
```
这个按钮可真是太酷了，可惜**它不会变**——无论在深色模式还是浅色模式，按钮的内容都是{% btn 深色模式::::fas fa-moon %}。

我不太喜欢这样，于是：

## 魔改这个按钮
### 思路一
{% note warning::这个思路行不通(或似乎行不通) %}

导航栏渲染的脚本位于 `layout\_partial\header.ejs`。

因此，我们只要魔改这个脚本就可以实现目标效果。
……吗？

似乎不行。~~至少我不会~~
**渲染时**我们无从得知客户端的颜色模式~~而且，again，我不会改~~。

### 思路二
既然我们无法在渲染时动手脚，那就只能求助于~~万能的~~ Javascript 了。

感谢伟大的 Volantis 提供了 `volantis.dark.mode` & `volantis.dark.push` 用于获取深色模式的状态、注册深色模式切换触发器的回调函数。
这样，我们可以实现以下方法来更新导航栏的按钮。
```javascript
const updateDarkmodeButtonLabel = () => {
  if (volantis.dark.mode == "dark") {
      document.getElementsByClassName("toggle-mode-btn")[0].innerHTML = "<i class=\"fas fa-sun fa-fw\"></i>浅色模式";
      document.getElementsByClassName("toggle-mode-btn")[1].innerHTML = "<i class=\"fas fa-sun fa-fw\"></i>浅色模式";
  } else {
      document.getElementsByClassName("toggle-mode-btn")[0].innerHTML = "<i class=\"fas fa-moon fa-fw\"></i>深色模式";
      document.getElementsByClassName("toggle-mode-btn")[1].innerHTML = "<i class=\"fas fa-moon fa-fw\"></i>深色模式";
  }
}
```
{% folding::进一步解释 %}
CSS 选择器 `.toggle-mode-btn` 会匹配到两个元素的原因是因为电脑和移动端不共用同一个导航栏。
在此我们需要同时修改这两个元素。
{% endfolding %}

接下来，我们只需要在适当的时候调用这个方法即可。我的实现如下。
```javascript
document.addEventListener('DOMContentLoaded', () => {
  updateDarkmodeButtonLabel();
  volantis.dark.push(() => {
      updateDarkmodeButtonLabel();
  })
}, { once: true });
```
{% folding::进一步解释 %}
为了尽可能早的进行初次更新，我们监听事件 `docuemnt.DOMContentLoaded` 而不是 `load` 或 `ready`；
这也是为什么我们要先调用这个方法一次，再注册回调。
{% endfolding %}

最后，我们要通过适当的方式将这段代码注入到页面中。我选用的方法是利用 `theme_inject`工具。
{% folding::把文件给我 %}
```javascript scripts/inject.js
// 此文件需要放在 blog/scripts 或 volantis/scripts 目录
// 此文件可以任意命名
hexo.extend.filter.register('theme_inject', function (injects) {
    injects.headEnd.file('darkmode-button-script', 'source/_data/darkmode-button.ejs');
});
```

```html source/_data/darkmode-button.ejs
<%# 此文件的位置要符合上方 inject 方法的参数 %>
<script>
  const updateDarkmodeButtonLabel = () => {
    if (volantis.dark.mode == "dark") {
      // $(".toggle-mode-btn").innerHTML = "<i class=\"fas fa-sun fa-fw\"></i>浅色模式";
      document.getElementsByClassName("toggle-mode-btn")[0].innerHTML = "<i class=\"fas fa-sun fa-fw\"></i>浅色模式";
      document.getElementsByClassName("toggle-mode-btn")[1].innerHTML = "<i class=\"fas fa-sun fa-fw\"></i>浅色模式";
    } else {
      // $(".toggle-mode-btn").innerHTML = "<i class=\"fas fa-moon fa-fw\"></i>深色模式";
      document.getElementsByClassName("toggle-mode-btn")[0].innerHTML = "<i class=\"fas fa-moon fa-fw\"></i>深色模式";
      document.getElementsByClassName("toggle-mode-btn")[1].innerHTML = "<i class=\"fas fa-moon fa-fw\"></i>深色模式";
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateDarkmodeButtonLabel();
    // volantis.pjax.push(() => {
    //   updateDarkmodeButtonLabel();
    // })
    volantis.dark.push(() => {
      updateDarkmodeButtonLabel();
    })
  }, { once: true });
</script>
```
{% endfolding %}