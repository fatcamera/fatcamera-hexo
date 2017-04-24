---
title: 网站管理
date: 2017-03-28 19:10:31
toc: true

categories:
  - 网络技术

tags:
  - 网站管理
---

# DNS
使用[DNSPod](https://www.dnspod.cn)管理DNS。
不要使用无www的CNAME解析，使用显性URL(301重定向)的方式解决无www访问。这可以避免[网易云跟帖](https://gentie.163.com/)的多域名聚合问题。

# Github Pages

## 自定义404页
在根目录下创建一个`404.html`即可。

