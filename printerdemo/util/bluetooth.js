/*!
 * Create by Winford
 */

//const HEX = require('./HEX.min.js');
const uni = wx;

// 请求权限蓝牙
const _authorizeBluetooth = () => {
  return new Promise(function (resolve, reject) {
    // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.bluetooth" 这个 scope
    uni.getSetting({
      success(res) {
        if (!res.authSetting['scope.bluetooth']) {
          uni.authorize({
            scope: 'scope.bluetooth',
            success() {
              // 用户已经同意小程序使用蓝牙功能，后续调用 wx.openBluetoothAdapter 接口不会弹窗询问
              resolve();
            }
          })
        } else {
          resolve();
        }
      }
    });
  });
}

// 初始化蓝牙
const _openBluetoothAdapter = () => {
	return new Promise(function(resolve, reject) {
		uni.closeBluetoothAdapter({
			fail: reject,
			complete() {
				// 初始化蓝牙
				uni.openBluetoothAdapter({
					success: resolve,
					fail: reject
				})
			}
		})
		// // 初始化蓝牙
		// uni.openBluetoothAdapter({
		// 	success: resolve,
		// 	fail: reject
		// })
	});
}

// 蓝牙建立连接
const _createBLEConnection = (deviceId) => {
	// 连接BLE
	return new Promise(function(resolve, reject) {
		uni.createBLEConnection({
			deviceId,
			success: resolve,
			fail: reject
		})
	});
}

const _getBLEDeviceServices = (deviceId) => {
	// 获取服务
	return new Promise(function(resolve, reject) {
		uni.getBLEDeviceServices({
			deviceId,
			success: (res) => {
				for (let i = 0; i < res.services.length; i++) {
					let service = res.services[i];
					if (service.isPrimary) {
						resolve(service);
						return;
					}
				}
				resolve();
				//resolve(await _getBLEDeviceServices(deviceId))
			},
			fail: reject
			// fail: function(e) {
			// 	console.log(e);
			// }
		})
	});
}

const _getBLEDeviceCharacteristics = (deviceId, serviceId) => {
	// 获取读写特征值
	return new Promise(function(resolve, reject) {
		uni.getBLEDeviceCharacteristics({
			deviceId,
			serviceId,
			success: (res) => {
				let characteristics = {};
				for (let i = 0; i < res.characteristics.length; i++) {
					let item = res.characteristics[i];
					//console.log(item);
					if (item.properties.notify) {
						characteristics.notify = characteristics.notify || item;
					}

					if (item.properties.write) {
						characteristics.write = characteristics.write || item;
					}

				}
				resolve(characteristics);
			},
			fail: reject
		});
	});
}

// 写数据
const _wxWriteBLECharacteristicValue = ({
	deviceId,
	serviceId,
	characteristicId,
	value
}) => {
	return new Promise(function(resolve, reject) {
		uni.writeBLECharacteristicValue({
			deviceId,
			serviceId,
			characteristicId,
			value,
			//writeType: 'writeNoResponse',
			//writeType: 'write',
			success: function() {
				resolve(true);
			},
			fail: function(e) {
				console.log(e);
				if (e.code == 10007) {
					// uniapp bug, retry.
					resolve(false);
				} else {
					reject(e)
				}
			}
		});
	});
}

const sleep = (time) => new Promise((resolve, reject) => setTimeout(resolve, time));

// 写数据
const _writeBLECharacteristicValue = async (deviceId, serviceId, characteristicId, value, mtu) => {
    // iOS: 10000; Android: 20
  mtu = mtu || (uni.getSystemInfoSync().platform === 'ios' ? 10000 : 20);
	const total = value.byteLength;
	console.log("================mtu=" + mtu, new Date())
	let num = 0;
	let count = 0;
	while (count < total) {
		const element = value.slice(count, count + mtu); // 取出MTU个数据
		if (element.byteLength === 0) break; // 表示已经发送完毕

		// num % 100 == 0 && await sleep(100);
		_wxWriteBLECharacteristicValue({
			deviceId,
			serviceId,
			characteristicId,
			value: element
		});
		count = count + element.byteLength;
		num++;
		// console.log("================count=" + count)
		// console.log("================num=" + num)
	}
	console.log("================num=" + num, new Date())

}


// 发现设备
const find = (onBluetoothDeviceFound) => {
  // 请求蓝牙权限
  _authorizeBluetooth().then(function () {
    // 初始化蓝牙
    return _openBluetoothAdapter();
  }).then(function(res) {
		// 添加监听
		uni.onBluetoothDeviceFound(function(res) {
			if (onBluetoothDeviceFound) {
				onBluetoothDeviceFound(res);
			}
		});
		uni.startBluetoothDevicesDiscovery();
	})
}

// 连接
const connect = async ({
	deviceId,
	onBLEConnectionStateChange,
	onBLECharacteristicValueChange,
	onDataFCValueChange,
}) => {
	let device = {
		connected: false,
		deviceId: deviceId,
		serviceId: '',
		notifyCharacteristicId: '',
		writeCharacteristicId: '',
		dataFCCharacteristicId: '',
		onBLEConnectionStateChange,
		onBLECharacteristicValueChange,
		onDataFCValueChange,
	};

  // 请求蓝牙权限
  await _authorizeBluetooth().then(function () {
    // 初始化蓝牙
    return _openBluetoothAdapter();
  }).then(function(res) {
		return new Promise((resolve, reject) => {
			// 添加监听
			uni.onBLEConnectionStateChange(function(res) {
				// 该方法回调中可以用于处理连接意外断开等异常情况
				device.connected = res.connected;
				if (device.onBLEConnectionStateChange) {
					device.onBLEConnectionStateChange(res);
				}
				if (res.connected) {
					resolve(res);
				} else {
					reject(res);
				}
			});
			// 连接BLE
			_createBLEConnection(deviceId);
		});

		// 添加监听
		// uni.onBLEConnectionStateChange(function(res) {
		// 	// 该方法回调中可以用于处理连接意外断开等异常情况
		// 	device.connected = res.connected;
		// 	if (device.onBLEConnectionStateChange) {
		// 		device.onBLEConnectionStateChange(res);
		// 	}
		// });
		// // 连接BLE
		// return _createBLEConnection(deviceId);
	}).then(async function(res) {
		// 获取服务
		await sleep(1000);
		let service = await _getBLEDeviceServices(deviceId);
		if (!service) {
			// 有时候获取不到，尝试重新获取
			await sleep(2000);
			service = await _getBLEDeviceServices(deviceId);
		}
		if (!service) {
			Promise.reject('获取service失败');
		} else {
			return service;
		}
	}).then(function(service) {
		// 获取读写特征值
		console.log('获取读写特征值')
		device.serviceId = service.uuid;
		return _getBLEDeviceCharacteristics(device.deviceId, device.serviceId);
	}).then(function(characteristics) {
		// 读
		device.notifyCharacteristicId = characteristics.notify ? characteristics.notify.uuid : '';
		// 写
		device.writeCharacteristicId = characteristics.write ? characteristics.write.uuid : '';
	}).catch(function(err) {
		console.log(err);
	});

	console.log('onBLECharacteristicValueChange')
	// 监听
	uni.onBLECharacteristicValueChange(function(res) {
		if (res.characteristicId === device.notifyCharacteristicId && device
			.onBLECharacteristicValueChange) {
			device.onBLECharacteristicValueChange(res);
		}
	});

	console.log('notifyBLECharacteristicValueChange')
	// 读监听
	if (device.notifyCharacteristicId) {
		uni.notifyBLECharacteristicValueChange({
			state: true, // 启用 notify 功能
			// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			deviceId: device.deviceId,
			// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
			serviceId: device.serviceId,
			// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
			characteristicId: device.notifyCharacteristicId,
			success(res) {
				//console.log(device.deviceId, res.errMsg);
			}
		});
	}

	// 写方法
	device.write = async (value, mtu) => {
		// console.log(device.deviceId, 'write', HEX.ab2hex(value));
		if (device.writeCharacteristicId) {
			await _writeBLECharacteristicValue(device.deviceId, device.serviceId, device
				.writeCharacteristicId, value, mtu);
		}
	};

	// 断开连接
	device.close = () => {
		uni.closeBLEConnection({
			deviceId: device.deviceId
		})
	};

	console.log(device);
	return device;
}


module.exports = {
	find,
	connect
}
