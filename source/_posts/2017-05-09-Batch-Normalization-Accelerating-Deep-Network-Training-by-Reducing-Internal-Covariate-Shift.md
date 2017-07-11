---
title: Batch Normalization Accelerating Deep Network Training by Reducing Internal Covariate Shift
date: 2017-05-09 17:35:28
toc: true
mathjax: true

categories:
- 机器学习

tags:
- 深度学习
- 2015
- ICML
---

<!--more-->

## 问题
神经网络中每层的参数不断变化，参数分布各不相同。训练依赖参数初始化方法，需要注设置很小的学习率。这都给训练神经网络造成了很大的困难。

## 方法
通过在网络中加入归一化层，对输入输出进行归一化，减少训练对初始参数的依赖，并允许使用较大的学习率加快训练过程。BN同时可以视作一种正则化方法，有时可以替代Dropout。

$$\hat{x} = \gamma \cdot \dfrac{x-E[x]}{\sqrt{Var[x]}} + \beta$$