---
title: Markdown语法
date: 2017-02-08 10:02:20
toc: true
comments: false

categories:
  - 网络技术

tags:
---

本文摘录一些Markdown语法的示例。

<!--more-->

## 标题

```
# first level
## second level
### third level
###### last level
```

## 格式化文本

```
**粗体**
__粗体__
*斜体*
_斜体_
~~删除线~~
```

**粗体**
__粗体__
*斜体*
_斜体_
~~删除线~~

## 引用

```
> 引用文本
```

> 引用文本

## 链接

```
[曹彬彬](http://fatcamera.github.io "曹彬彬")

[曹彬彬][1]
[1]: http://fatcamera.github.io "曹彬彬"

[曹彬彬][]
[曹彬彬]: http://fatcamera.github.io "曹彬彬"
```

[曹彬彬](http://fatcamera.github.io "曹彬彬")

[曹彬彬][1]
[1]: http://fatcamera.github.io "曹彬彬"

[曹彬彬][]
[曹彬彬]: http://fatcamera.github.io "曹彬彬"

## 列表

```
1. list item A
  - list item AA
  - list item AB
2. list item B
  * list item BA
    1. list item BAA
    2. list item BAB
  * list item BB
```

1. list item A
  - list item AA
  - list item AB
2. list item B
  * list item BA
    1. list item BAA
    2. list item BAB
  * list item BB

## 表格

```
| Left-aligned | Center-aligned | Right-aligned |
| :---         |     :---:      |          ---: |
| git status   | git status     | git status    |
| git diff     | git diff       | git diff      |
```

| Left-aligned | Center-aligned | Right-aligned |
| :---         |     :---:      |          ---: |
| git status   | git status     | git status    |
| git diff     | git diff       | git diff      |

## 图像

```
![神经网络示意图](/content/images/2017/2/dnn_demo.png "神经网络")
```

![神经网络示意图](http://cdn.binbincao.com/images/2017/2/dnn_demo.png "神经网络")
