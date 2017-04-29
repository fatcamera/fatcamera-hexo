---
title: 网站开发与管理
date: 2017-03-28 19:10:31
toc: true

categories:
  - 网络技术

tags:
  - 网站管理
---

本文记录一些个人网站建设过程中的经验。

<!--more-->

## PureCSS
https://purecss.io

## Jade/Pug
https://pugjs.org

## DNS
使用[DNSPod](https://www.dnspod.cn)管理DNS。
不要使用无www的CNAME解析，使用显性URL(301重定向)的方式解决无www访问。这可以避免[网易云跟帖](https://gentie.163.com/)的多域名聚合问题。

## Github Pages

### 自定义域名
1. 在source目录下创建文件`CNAME`，文件内容为自定义的域名。
1. 修改DNS，添加CNAME记录，指向username.github.io

### 自定义404页
在source目录下创建一个`404.md`即可。hexo会在根目录下生成一个`404.html`。

参见：[Creating a custom 404 page for your GitHub Pages site](https://help.github.com/articles/creating-a-custom-404-page-for-your-github-pages-site/)


