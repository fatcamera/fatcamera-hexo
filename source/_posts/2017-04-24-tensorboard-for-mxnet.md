---
title: 在MXNet中使用Tensorboard
date: 2017-04-24 20:38:20
toc: true

categories:
- 机器学习

tags:
- 深度学习
- MXNet
---

[Tensorboard](https://www.tensorflow.org/get_started/summaries_and_tensorboard)是[Tensorflow](https://www.tensorflow.org/)自带的可视化和调试工具. [Zihao Zheng](http://zihaolucky.github.io/)将tensorboard从tensorflow剥离出来，成为了一个[独立的可视化工具](https://github.com/dmlc/tensorboard)，已经实现了部分功能接入MXNet。目前支持指定变量的可视化监控。

<!--more-->

Tensorboard主要包含两个模块

- **日志模块** 通过在网络中加入监控节点，将需要监控的变量序列化到磁盘
- **渲染模块** 读取序列化日志，在web端展示可视化内容。

## 功能
Tensorboard支持5种可视化功能：

- **scalars**: 数值，例如监控训练误差和测试误差。
- **histograms**: 分布/直方图，例如监控weight, gradient, bias等。
- **images**: 图像，可以直观监控convolution filter，activation等。
- audio: MXNet暂时不可用
- graph: MXNet暂时不可用，可以使用MXNet自带的`mxnet.viz.plot_network`实现


## 应用示例
使用Tensorboard可以分为三步：

1. 在训练过程的代码中加入监控代码，设置监控日志的存储位置，和需要监控的变量。通常只需要几行代码；
2. 运行程序，训练的过程中日志会自动保存。
3. 打开Tensorboard客户端，查看可视化结果。

这里使用MLP模型在[MNIST](http://yann.lecun.com/exdb/mnist/)数据集上进行训练，演示这一过程。

### 初始化
初始化，设置日志格式。
```python
import mxnet as mx
import logging
import tensorboard
import numpy as np

# setup logging
head = '%(asctime)-15s %(message)s'
logging.basicConfig(level=logging.DEBUG, format=head)
```
### 读取数据
这里使用MXNet已有的[MNISTIter](http://mxnet.io/api/python/io.html#mxnet.io.MNISTIter)类读取数据。需要先下载[MNIST](http://yann.lecun.com/exdb/mnist/)数据集，将解压后的文件放置在data目录下。
```python
num_examples = 60000
batch_size = 100
num_batches = num_examples / batch_size
train_iter = mx.io.MNISTIter(image='data/train-images-idx3-ubyte', label='data/train-labels-idx1-ubyte', batch_size=batch_size, flat=True)
eval_iter = mx.io.MNISTIter(image='data/t10k-images-idx3-ubyte', label='data/t10k-labels-idx1-ubyte', batch_size=batch_size, flat=True)
```
### 构建网络结构
这里使用MXNet的Symbol构建一个两层的MLP，最后接一个Softmax层。
```python
num_classes = 10
mlp = mx.sym.Variable('data')
mlp = mx.sym.FullyConnected(data=mlp, name='fc1', num_hidden=128)
mlp = mx.sym.Activation(data=mlp, name='relu1', act_type="relu")
mlp = mx.sym.FullyConnected(data=mlp, name = 'fc2', num_hidden = 64) 
mlp = mx.sym.Activation(data=mlp, name='relu2', act_type="relu")
mlp = mx.sym.FullyConnected(data=mlp, name='fc3', num_hidden=num_classes)
mlp = mx.sym.SoftmaxOutput(data=mlp, name='softmax')
mx.viz.plot_network(mlp)
```
网络结构如下图

![mxnet-mlp](http://cdn.binbincao.com/images/2017/4/mxnet-mlp.png)

### 创建模型
这里使用MXNet的**Module**接口进行训练。Module接口提供了一些**回调函数**，通过在回调函数中加入监控代码，就可以在训练过程中将需要监控的内容存储下来。下面给出了几个常用监控场景的代码示例。

#### 初始化模型
设置一些训练参数，初始化回调函数列表。
```python
# build model
model = mx.mod.Module(symbol=mlp, context=mx.cpu())
optimizer_params = {
    'learning_rate': 0.01, # learning rate
    'momentum': 0.9, # momentum
    'wd': 0.0001, # weight decay
    'lr_scheduler': mx.lr_scheduler.FactorScheduler(num_batches, factor=0.9)
}
batch_end_callbacks = [mx.callback.Speedometer(batch_size, 100)]
epoch_end_callbacks = []
eval_batch_end_callbacks = []
eval_end_callbacks = []
```
#### 初始化日志序列化模块
tensorboard.FileWriter对象，用于将监控日志写入磁盘，供tensorboard前端可视化使用。
```python
# initialize summary writer
summary_writer = tensorboard.FileWriter('logs/')
```
#### 监控训练集误差
注册到batch_end_callback中，每个epoch的最后一个batch结束时调用一次。
```python
# monitor train accuracy at the end of each epoch
def monitor_train_acc(param):
    if param.nbatch + 1 == num_batches: # last batch
        metric = dict(param.eval_metric.get_name_value())
        summary_writer.add_summary(tensorboard.summary.scalar('train-accuracy', metric['accuracy']))
batch_end_callbacks.append(monitor_train_acc)
```
#### 监控验证集误差
注册到eval_end_callback中，每个epoch结束时调用一次。
```python
# monitor evaluation accuracy at the end of each epoch
def monitor_eval_acc(param):
    metric = dict(param.eval_metric.get_name_value())
    summary_writer.add_summary(tensorboard.summary.scalar('eval-accuracy', metric['accuracy']))    
eval_end_callbacks.append(monitor_eval_acc)
```
#### 监控fc1层权重矩阵的残差
使用mx.mon.Monitor类实现。
```python
# monitor fc1 gradient using Monitor
def monitor_fc1_gradient(g):
    summary_writer.add_summary(tensorboard.summary.histogram('fc1-backward-weight', g.asnumpy().flatten()))
    stat = mx.nd.norm(g) / np.sqrt(g.size)
    return stat
monitor = mx.mon.Monitor(100, monitor_fc1_gradient, pattern='fc1_backward_weight')
```
#### 监控fc1层的权重矩阵
注册到batch_end_callback，每100个batch调用一次。
```python
# monitor fc1 weight every 100 batches
def monitor_fc1_weight(param):
    if param.nbatch % 100 == 0:
        arg_params, aux_params = param.locals['self'].get_params()
        summary_writer.add_summary(tensorboard.summary.histogram('fc1-weight', arg_params['fc1_weight'].asnumpy().flatten()))
batch_end_callbacks.append(monitor_fc1_weight)
```
#### 监控fc1层的权重矩阵
用**图像**表示。注册到epoch_end_callback，每个epoch结束时调用一次。
```python
# monitor fc1 weight at the end of each epoch
def monitor_fc1_weight_img(epoch, net, arg_params, aux_params):
    img = arg_params['fc1_weight'].asnumpy()
    img = img[..., np.newaxis]
    img = (img - img.min()) * 0xffff / (img.max() - img.min())
    img = img.astype(np.int16)
    summary_writer.add_summary(tensorboard.summary.image('fc1-weight_epoch{0}'.format(epoch), img))
epoch_end_callbacks.append(monitor_fc1_weight_img)
```
#### 开始训练
```python
# start training
model.fit(
    train_data=train_iter,
    begin_epoch=0,
    num_epoch=20,
    eval_data=eval_iter,
    eval_metric='accuracy',
    optimizer='sgd',
    optimizer_params=optimizer_params,
    initializer = mx.init.Uniform(),
    batch_end_callback = batch_end_callbacks,
    epoch_end_callback = epoch_end_callbacks,
    eval_batch_end_callback = eval_batch_end_callbacks,
    eval_end_callback = eval_end_callbacks,
    monitor = monitor
)

# close summary writer
summary_writer.close()
```
运行输出如下
```
2017-04-04 11:15:49,505 Batch:       1 fc1_backward_weight            0.0298154	
2017-04-04 11:15:52,931 Batch:     101 fc1_backward_weight            0.103132	
2017-04-04 11:15:52,933 Epoch[0] Batch [100]	Speed: 2919.34 samples/sec	Train-accuracy=0.364455
2017-04-04 11:15:55,455 Batch:     201 fc1_backward_weight            0.148941	
2017-04-04 11:15:55,456 Epoch[0] Batch [200]	Speed: 3964.80 samples/sec	Train-accuracy=0.717600
2017-04-04 11:15:58,192 Batch:     301 fc1_backward_weight            0.263426	
2017-04-04 11:15:58,193 Epoch[0] Batch [300]	Speed: 3654.82 samples/sec	Train-accuracy=0.855200
2017-04-04 11:16:01,104 Batch:     401 fc1_backward_weight            0.191485	
2017-04-04 11:16:01,106 Epoch[0] Batch [400]	Speed: 3435.41 samples/sec	Train-accuracy=0.880500
2017-04-04 11:16:03,441 Batch:     501 fc1_backward_weight            0.239398	
2017-04-04 11:16:03,443 Epoch[0] Batch [500]	Speed: 4280.32 samples/sec	Train-accuracy=0.894700
2017-04-04 11:16:05,940 Epoch[0] Train-accuracy=0.901414
2017-04-04 11:16:05,942 Epoch[0] Time cost=16.598
2017-04-04 11:16:07,061 Epoch[0] Validation-accuracy=0.919000
2017-04-04 11:16:07,227 Update[601]: Change learning rate to 9.00000e-03
2017-04-04 11:16:07,231 Batch:     601 fc1_backward_weight            0.163737	
2017-04-04 11:16:09,589 Batch:     701 fc1_backward_weight            0.209277	
...
```

### 查看监控
模型训练的同时，logs目录下会生成proto格式的监控日志。使用下面的命令调起tensorboard的渲染服务。这个服务是一个webservice，会周期性的监控日志目录的更新，可以使用浏览器**远程访问**。
```sh
tensorboard --logdir=logs --port=8990
```

SCALARS页面显示了我们监控的训练集误差和验证集误差。

![mxnet-tensorboard-scalar](http://cdn.binbincao.com/images/2017/4/mxnet-tensorboard-scalar.png)

IMAGES页面使用灰度图的形式显示了我们监控的fc1层的权重矩阵。

![mxnet-tensorboard-image](http://cdn.binbincao.com/images/2017/4/mxnet-tensorboard-image.png)

DISTRIBUTIONS和HISTOGRAMS页面显示了我们监控的fc1层的权重矩阵和残差，可以看到它们的分布随时间的变化。

![mxnet-tensorboard-distribution](http://cdn.binbincao.com/images/2017/4/mxnet-tensorboard-distribution.png)

![mxnet-tensorboard-histogram](http://cdn.binbincao.com/images/2017/4/mxnet-tensorboard-histogram.png)
