---
title: 读懂Caffe代码框架
date: 2017-02-08 18:35:25
toc: true

categories:
- 机器学习

tags:
- 深度学习
- Caffe
---

自2002年神经网络的相关研究再次成为热点以来，学术界和业界产生了一系列深度学习的计算框架。根本原因是深度学习对硬件环境的依赖很高，对于开发者有较高的门槛。深度学习计算框架的出现，屏蔽了大量硬件环境层面的开发代价，使研究者和开发人员可以专注于算法的实现，快速迭代。

<!--more-->

深入了解和熟练掌握一个深度学习的计算框架也不是一间易事，往往需要几周到几个月的时间。对于目前出现的几十个深度学习计算框架，这里给出一个概览，方便针对不同的需求进行选择。目前比较热门的框架包括：Torch, Theano, Caffe, TensorFlow, MXNet, CNTK, PaddlePaddle，完整的列表可以参见《Comparison of deep learning software》。下面的表格给出了这些框架的基本信息，比较重要的是开发者和接口语言。

上面这些框架中，Caffe使用最为方便。目前学术界大部分的paper都有Caffe的实现，对于快速尝试原型是较好的选择。如果需要进行订制化开发，TensorFlow和MXNet是较好的两个选择，百度自己的PaddlePaddle也可以考虑。下面展开介绍一下Caffe。

## Caffe的设计思路

上图是一个简单的神经网络示意图。神经网络由一层层的神经元节点组成。训练数据从输入层(input layer)节点输入，中间的隐层(hidden layer)节点做一些运算，输出层(output layer)连接标注，就可以通过梯度下降法迭代的更新网络权重，完成一次机器学习过程。在这个过程中，有几个要素，网络中的数据流，负责运算的节点算子，层次化的网络结构，以及最后的优化算法。Caffe把这4个部分进行抽象和封装，就形成了一套深度学习的计算框架。简单的说，Caffe = 数据流 + 节点算子 + 网络结构 + 优化算法。

## Caffe的实现架构和源码解析

上图是Caffe的架构图，罗列了Caffe中主要的几个类和接口。对照Caffe的官方文档，把这个图理清楚，基本就可以掌握Caffe的实现原理了。

Caffe中用Blob表示数据，类似于Numpy中的ndarry，可以理解为一个n为数组。深度学习计算过程中，数据、参数、残差等都用这个类型表示。data_字段是数据，diff_字段用来辅助存储残差，shape_字段是数据的维度形状。Blob封装了CPU和GPU之间的数据同步问题，提供了cpu_data/mutable_cpu_data这样的接口。通过调用这些接口，开发者可以不用关心计算过程中数据到底是存在CPU上还是GPU上，两个设备上的数据是否同步等问题。

Caffe中用Layer表示神经网络中的一层，通过定义不同的Layer来实现不同的算子。目前Caffe已经提供了大量内置的算子，例如数据读取，损失函数，卷积，激活函数等。如果需要实现自定义的运算，开发者可以实现自己的Layer，通过LayerRegistry注册到Caffe中，就可以调用了。

Caffe中用Net表示网络结构。Net存储了网络中所有的层，以及层的输入输出，参数等等。Net中提供了Forward，Backward，Update接口，对应神经网络优化过程中的前向传播，反向传播，参数更新操作。

Caffe中用Solver表示优化算法。Solver中的Step函数调用Net中的接口实现一轮参数迭代，Snapshot和Restore提供了模型快照的存取功能。

## Caffe的应用

Caffe提供了方便快捷的命令行调用方式，一般分为下面几个步骤：

1. 准备数据，将数据转换为Caffe认识的格式
2. 编写网络结构，可以参照caffe/src/caffe/proto/caffe.proto中对于NetParameter的定义
3. 编写训练配置，可以参照caffe/src/caffe/proto/caffe.proto中对于SolverParameter的定义
4. 训练，Caffe针对常见的场景提供了三种命令
  1. 开始训练：caffe train –solver=solver.prototxt
  2. 继续被中断的训练：caffe train –solver=solver.prototxt –snapshot=net.solverstate
  3. 使用预训练的模型初始化参数：caffe train –solver=solver.prototxt –weights=net.caffemodel
5. 预测：caffe test –model=solver.prototxt –weights=net.caffemodel

除命令行之外，Caffe也提供了Python接口。可以更自由的构建网络和控制训练过程，使用起来也很方便。具体的应用举例可以参考官方文档中的例子。

## Caffe相关资源

官方文档：[http://caffe.berkeleyvision.org/](http://caffe.berkeleyvision.org/)

神经网络结构可视化工具：[http://ethereon.github.io/netscope/#/editor](http://ethereon.github.io/netscope/#/editor)

Caffe数据转换脚本：[http://deepdish.io/2015/04/28/creating-lmdb-in-python/](http://deepdish.io/2015/04/28/creating-lmdb-in-python/)
