var KeyManager = require('./KeyManager');

var options = {

	echonest: {
		keys: ['U50YPIJZE763SM37V', 'DZ4L5L0PETK272RLT'],
		margin: 20,
		rateLimit: 120,
		timeLimit: 60000
	},


	lastFm: {
		keys: [
			{
				key: '0e9488a190653e73d49ced7681de73cb',
				secret: '6967955dda561acbbfb4f1e532e7b76b'
			},
			{
				key: '10506a7478bf8f5397c67cf733bb81c4',
				secret: 'cf867dfb7fa3766e82e83869ea5a4c89'
			},
			{
				key: '13f17d552c4577fd81f341ed4996b7d1',
				secret: 'fc59dbb09338f411c09af6290595d467'
			},
			{
				key: '18e6991012c12d1cea7db05ad6669c6c',
				secret: '07d2c25400dc7b58eaeeba61a9db55c0'
			},
			{
				key: '20545e275660be5ca40cffdbd0f0b273',
				secret: '332b41216405a7c1eacd2bafaccef3da'
			},
			{
				key: '2063336b0d35794a38bcc6cc8cb1cea8',
				secret: 'ac7cff047364d164bb032162ee361b67'
			},
			{
				key: '2d46418cc96776a97b5cab1cb804e622',
				secret: '9bdc36bbd2aa69e30e53586a8bdd46bf'
			},
			{
				key: '34630b6366afe8eb1a4cd10e579d8b0c',
				secret: 'e3e4af0422d18c2ef6b055a643319cf0'
			},
			{
				key: '46d776bcdd34699dd56b67a6c98d867e',
				secret: 'f254f4e1a711e8c1eb42e0001c94925f'
			},
			{
				key: '470a495ae05856e31582916770ce8b94',
				secret: 'c9f4578f55aa4a1cfbbab1168fc28fd5'
			},
			{
				key: '4e8204c94231a4ba38e1db8942c78150',
				secret: '0edf0d71544226df6b22ccc526a2da90'
			},
			{
				key: '58209658d0ee84f50b1d8610683a3c9f',
				secret: '202dc925550e86ef524a8c2305c4e1a9'
			},
			{
				key: '6a3cef79565c6a351e8444171b2b1907',
				secret: '1cf38b3697929bc6a2a86eca9f0b2add'
			},
			{
				key: '6a7a0078fbaf46b91e21b0c6dc2baf4c',
				secret: '5e89da7e10af2525aca877189f3bf3f1'
			},
			{
				key: '6ca0bedbbebbe1d0258f5aec1c2f88b6',
				secret: '02c70797b394baa5a45b6387502b4c82'
			},
			{
				key: '6d29bc90d97637a3f2f46ee34da5af7e',
				secret: '62330bfc3b04d369e44c3cecc56e2f16'
			},
			{
				key: '709b7df004e13e8b7a7a2408bab0d2e7',
				secret: 'd2990f4c4533c7364d50c4dd3a5ef47f'
			},
			{
				key: '72ddda7362708e385a90117c394b3b6a',
				secret: 'c1e8e6901d287d0a259c2096b1557d0b'
			},
			{
				key: '84449ac6abe07928b1151c05a55f78f6',
				secret: '921b3447af6fec9b6f434da86329dfd6'
			},
			{
				key: '854503c17b44b98ff34bccd4c9930255',
				secret: '12332567a16f664a002646c9776e4dde'
			},
			{
				key: '85ccbbf57ca78fc77375a3a3bf9ded87',
				secret: '10b6dbab80bb1a76ca6d3db21fbfd4ca'
			},
			{
				key: '8b7851d8a815b6396a9553bb85cf6440',
				secret: 'a0fc5b6cc440f73b63bf30b10a714835'
			},
			{
				key: '901e5194dbca0475399f8179457eabf3',
				secret: '68f1bc79f4dd126b7b8722db8ce06770'
			},
			{
				key: '9d56d639de1bdc503edf4799f45c926b',
				secret: 'a4f40fcc69f8a3c252285f663dd21c40'
			},
			{
				key: 'a93c20155eb6f4c6bae9e99a6e803da6',
				secret: 'f233710a493b7c9a28526f29b5320bc3'
			},
			{
				key: 'a9482e6d74c4c925aac5a560a3f51383',
				secret: 'def1169b811b752a760a363a3d809567'
			},
			{
				key: 'aba9dc5a72dc65ebf133da3afac159dd',
				secret: 'ab450909ea54eab3c2bc82641c79c6c6'
			},
			{
				key: 'af9dcd7846bef3fc7980542409f79e69',
				secret: '95d623726d32049a806a95464076e915'
			},
			{
				key: 'c8a6c095b3c3fde3286337ae394b0470',
				secret: '1145bd47ddc40ced7d7adb9dfea167a3'
			},
			{
				key: 'ce17e35e49aa6b825f983b2e48e9da06',
				secret: '82a49c13b23e87288903ea98d9951346'
			},
			{
				key: 'db0163c949c1c6e9270584bf19d118d5',
				secret: '5d6a97fda8fb8ef06764447c68ca544f'
			},
			{
				key: 'dbb0c9de7827f1e08705da88275ed9be',
				secret: '219d3c3a7cd01d176fcd8e5a3a502a0f'
			},
			{
				key: 'e13cbd7348f8fda67c749110ff458fcd',
				secret: '29d70189a31609a41adaf52b83978e4a'
			},
			{
				key: 'e8d35a930e06e400f70725780434a381',
				secret: 'be84605032df0322ad01a1c5ce1f1751'
			},
			{
				key: 'edbe33f337d0799011b44490303f8b0a',
				secret: '6d827e8b9c0f86ab561a50da058cb4a8'
			},
			{
				key: 'f0907f579571a2953db444deb032d858',
				secret: '09eedefbe4e5a7e302fec2e157874c01'
			},
			{
				key: 'f1a3de8af515c6bc1325b2c90b60a334',
				secret: 'd0a02aec6f9c176af1c1d668faa144c6'
			},
			{
				key: 'f3dea80710afa29d17c55fac103d798d',
				secret: 'fa4dbc562f29573f0d35ecb38a4d2dc3'
			},
			{
				key: 'f60630c9ac2b0cd418945b6adf852ce9',
				secret: 'e0b74cbb394eb8fd36e14cb6da6be87b'
			},
			{
				key: 'f8a90170d7df20b816b27164c28bbf73',
				secret: 'fc655e4c8637e30d7ceb43cb57b2b45d'
			},
			{
				key: 'f8b8b3ebb72949e5d7cbc714a5c8728c',
				secret: 'f0822e75d59b3b226628074add6b'
			},
			{
				key: '09b92498d975ad4998db2ce556f77d63',
				secret: '759c8cdc5a989dd60b619bf1b1fe3637'
			},
			{
				key: '0a813afe040a0f61469ad85ef9b48785',
				secret: 'aae6a74c180b694d48a1bb7804e60999'
			},
			{
				key: '0e0406d924d089217ac702a2911ca2f0',
				secret: '2c3717f7440eb1d64a924199d1011dea'
			},
			{
				key: '26ddf40096ae6fbb203c9c97b4887353',
				secret: 'fd3c9bd1caa63a7ba2bae1235511e3ce'
			},
			{
				key: '3fadd5aeff949a6d0783f495c86b7c80',
				secret: '869a71d32ec27a5f73de448ee89f4fb8'
			},
			{
				key: '42368125c83a98cc1091ac66fbd5d461',
				secret: '9c382d125560a2b138d8721a813f3510'
			},
			{
				key: '424c0828c641c066c9465b8464b0579c',
				secret: '5ae3bcdd24bbe18a395266274f596577'
			},
			{
				key: '444ee0d423dc2c2b78d27159394f9b07',
				secret: '1a6a06edbbd2055aa25adc49c5836e84'
			},
			{
				key: '5868d545a537a658d02fa42fcc5b2958',
				secret: '56ade9567ac979bac3132f6869dcb84d'
			},
			{
				key: '61f5b6eeaa18c3c5efac8c88f97d60fe',
				secret: 'b05003108a0aa04efbdfc7dcd71f5dbb'
			},
			{
				key: '8652cf2d07fc1fa9d2f042441e83c81b',
				secret: '660a43661e6e69b6af0bd9f49caace1a'
			},
			{
				key: '86a849d137052d6b3bf2b97a4909a59a',
				secret: 'eb1648c249b4866ee3954d1e7af150a6'
			},
			{
				key: '88d91e78bbe2f1521b3f7c363a33dac6',
				secret: '170d6defc81d65e29aa8ed3e4f2c7287'
			},
			{
				key: '9df571b0c2b9626c4d56c099d1c9772d',
				secret: '4ee4151b784078b92ddff16255ba6a2f'
			},
			{
				key: 'acf5e2e413e4a5ed0e300cd195694830',
				secret: 'e642fd39021c3f29d19d493460842afd'
			},
			{
				key: 'afdf5209c516349f0b6663ef8331a739',
				secret: '348958a2aac488a2f7b9131d58c5d510'
			},
			{
				key: 'afe62ea188af871afc34c055f50dc50e',
				secret: '37804dba9cac2cda1763d632ba3422e8'
			},
			{
				key: 'b02ef56165e6ab43a4be451f6d06e629',
				secret: 'c3918252f0b0b9787ab26ed9320c327d'
			},
			{
				key: 'b15ab054016a86a26b7bf406f0f5a2f3',
				secret: '90a5e592abc0c1a703f2ea8fb9765c9d'
			},
			{
				key: 'b229c9262c631b48d34613408ac841a0',
				secret: '62ef3b438570b7518b4c5ee618af482b'
			},
			{
				key: 'b6322a83f13dd06a333a95aa269dc08e',
				secret: '84fbc1d46bc265cb5412d4d7d5930e66'
			},
			{
				key: 'b95a30697e22c08cbebb1c6eb5f525e8',
				secret: 'edad838ea06a58be4cca956ac05acc80'
			},
			{
				key: 'be20311b5b18cacfe7c7c26fc9229f2d',
				secret: '7c9f3bbd2139d1e8e355ca4aac66f1f9'
			},
			{
				key: 'c4e7e3883c2d0d655ff9d80e667f988d',
				secret: 'e0748a3181334a80cf4a977e3ab1c7a2'
			},
			{
				key: 'da94dd72bba15f27861856851fa3297d',
				secret: '82abdd72ac9e1fc3598ed038c841a03f'
			},
			{
				key: 'de2acb1686be4c9744c4c32784f7a651',
				secret: 'a61711eb6833a87a826b76a32ef4a610'
			},
			{
				key: 'df305863ea2abd812de2e884a0ac0af6',
				secret: '53177946dcfe53a66be0e40d6e0970a7'
			},
			{
				key: 'dfa90a2ce0df543b01090e6f34ef06b0',
				secret: '73044b780c5eb1cbc9d07fdee06c024a'
			},
			{
				key: 'e5cc9865a36a093d1a7ba5ba25bd0b1c',
				secret: '14fb8d0d0f565838dae8f09c8a9de4c5'
			},
			{
				key: 'eec32985cce8d06cd6ae630087d366c2',
				secret: 'a017701a0611ebc6751c007f5ce5de6a'
			},
			{
				key: 'fb25b1d08d658cac530e1e1ca762a33a',
				secret: 'bc571bde197e74e02dd0ebe7a84348ec'
			}
		],
		margin: 1,
		rateLimit: 5,
		timeLimit: 1000
	}
};


var echonestKeyManager = new KeyManager(options.echonest);


module.exports = {

	echonest: echonestKeyManager

};