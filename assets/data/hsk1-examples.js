// Example sentences per HSK 1 headword, keyed by hanzi so lookups can't drift
// from the vocabulary list. Each word has an array of sentences; the app picks
// one at random. Sentences stay close to HSK 1 vocabulary; pinyin is tone-marked
// with common sandhi applied (不 -> bú, 一 -> yì/yí) to match the synthesizer.
export const HSK1_EXAMPLES = {
  '爱': [
    { hanzi: '我爱我的家。', pinyin: 'Wǒ ài wǒ de jiā.', en: 'I love my family.' },
    { hanzi: '妈妈很爱我。', pinyin: 'Māma hěn ài wǒ.', en: 'Mom loves me a lot.' },
    { hanzi: '你爱不爱喝茶？', pinyin: 'Nǐ ài bu ài hē chá?', en: 'Do you love drinking tea?' }
  ],
  '八': [
    { hanzi: '我有八本书。', pinyin: 'Wǒ yǒu bā běn shū.', en: 'I have eight books.' },
    { hanzi: '现在八点了。', pinyin: 'Xiànzài bā diǎn le.', en: "It's eight o'clock now." },
    { hanzi: '他家有八个人。', pinyin: 'Tā jiā yǒu bā gè rén.', en: 'There are eight people in his family.' }
  ],
  '爸爸': [
    { hanzi: '我爸爸是医生。', pinyin: 'Wǒ bàba shì yīshēng.', en: 'My dad is a doctor.' },
    { hanzi: '爸爸在家吗？', pinyin: 'Bàba zài jiā ma?', en: 'Is dad at home?' },
    { hanzi: '爸爸喜欢喝茶。', pinyin: 'Bàba xǐhuan hē chá.', en: 'Dad likes drinking tea.' }
  ],
  '杯子': [
    { hanzi: '这个杯子很大。', pinyin: 'Zhège bēizi hěn dà.', en: 'This cup is big.' },
    { hanzi: '桌子上有一个杯子。', pinyin: 'Zhuōzi shàng yǒu yí gè bēizi.', en: "There's a cup on the table." },
    { hanzi: '这是谁的杯子？', pinyin: 'Zhè shì shéi de bēizi?', en: 'Whose cup is this?' }
  ],
  '北京': [
    { hanzi: '我想去北京。', pinyin: 'Wǒ xiǎng qù Běijīng.', en: 'I want to go to Beijing.' },
    { hanzi: '北京很大。', pinyin: 'Běijīng hěn dà.', en: 'Beijing is big.' },
    { hanzi: '他住在北京。', pinyin: 'Tā zhù zài Běijīng.', en: 'He lives in Beijing.' }
  ],
  '本': [
    { hanzi: '我买了三本书。', pinyin: 'Wǒ mǎi le sān běn shū.', en: 'I bought three books.' },
    { hanzi: '这本书很好。', pinyin: 'Zhè běn shū hěn hǎo.', en: 'This book is good.' },
    { hanzi: '你有几本书？', pinyin: 'Nǐ yǒu jǐ běn shū?', en: 'How many books do you have?' }
  ],
  '不': [
    { hanzi: '我不喝茶。', pinyin: 'Wǒ bù hē chá.', en: "I don't drink tea." },
    { hanzi: '他不在家。', pinyin: 'Tā bú zài jiā.', en: "He's not home." },
    { hanzi: '我不想去。', pinyin: 'Wǒ bù xiǎng qù.', en: "I don't want to go." }
  ],
  '不客气': [
    { hanzi: '不客气，再见。', pinyin: 'Bú kèqi, zàijiàn.', en: "You're welcome, goodbye." },
    { hanzi: '谢谢！不客气。', pinyin: 'Xièxie! Bú kèqi.', en: "Thanks! You're welcome." },
    { hanzi: '不客气，朋友。', pinyin: 'Bú kèqi, péngyou.', en: "You're welcome, friend." }
  ],
  '菜': [
    { hanzi: '这个菜很好吃。', pinyin: 'Zhège cài hěn hǎochī.', en: 'This dish is delicious.' },
    { hanzi: '妈妈做的菜很好吃。', pinyin: 'Māma zuò de cài hěn hǎochī.', en: 'The food mom makes is delicious.' },
    { hanzi: '你想吃什么菜？', pinyin: 'Nǐ xiǎng chī shénme cài?', en: 'What dish do you want to eat?' }
  ],
  '茶': [
    { hanzi: '我喜欢喝茶。', pinyin: 'Wǒ xǐhuan hē chá.', en: 'I like to drink tea.' },
    { hanzi: '请喝茶。', pinyin: 'Qǐng hē chá.', en: 'Please drink tea.' },
    { hanzi: '这是中国茶。', pinyin: 'Zhè shì Zhōngguó chá.', en: 'This is Chinese tea.' }
  ],
  '吃': [
    { hanzi: '我想吃米饭。', pinyin: 'Wǒ xiǎng chī mǐfàn.', en: 'I want to eat rice.' },
    { hanzi: '你吃饭了吗？', pinyin: 'Nǐ chī fàn le ma?', en: 'Have you eaten?' },
    { hanzi: '中午我们吃菜。', pinyin: 'Zhōngwǔ wǒmen chī cài.', en: 'We eat food at noon.' }
  ],
  '出租车': [
    { hanzi: '我坐出租车去。', pinyin: 'Wǒ zuò chūzūchē qù.', en: "I'll take a taxi there." },
    { hanzi: '出租车在哪儿？', pinyin: 'Chūzūchē zài nǎr?', en: 'Where is the taxi?' },
    { hanzi: '坐出租车去饭店。', pinyin: 'Zuò chūzūchē qù fàndiàn.', en: 'Take a taxi to the restaurant.' }
  ],
  '打电话': [
    { hanzi: '我想打电话。', pinyin: 'Wǒ xiǎng dǎ diànhuà.', en: 'I want to make a phone call.' },
    { hanzi: '明天我打电话。', pinyin: 'Míngtiān wǒ dǎ diànhuà.', en: "I'll call tomorrow." },
    { hanzi: '他在打电话。', pinyin: 'Tā zài dǎ diànhuà.', en: 'He is making a phone call.' }
  ],
  '大': [
    { hanzi: '这个苹果很大。', pinyin: 'Zhège píngguǒ hěn dà.', en: 'This apple is big.' },
    { hanzi: '他的家很大。', pinyin: 'Tā de jiā hěn dà.', en: 'His home is big.' },
    { hanzi: '这个太大了。', pinyin: 'Zhège tài dà le.', en: 'This is too big.' }
  ],
  '的': [
    { hanzi: '这是我的书。', pinyin: 'Zhè shì wǒ de shū.', en: 'This is my book.' },
    { hanzi: '那是谁的？', pinyin: 'Nà shì shéi de?', en: 'Whose is that?' },
    { hanzi: '这是老师的电脑。', pinyin: 'Zhè shì lǎoshī de diànnǎo.', en: "This is the teacher's computer." }
  ],
  '点': [
    { hanzi: '现在三点。', pinyin: 'Xiànzài sān diǎn.', en: "It's three o'clock." },
    { hanzi: '现在几点？', pinyin: 'Xiànzài jǐ diǎn?', en: 'What time is it?' },
    { hanzi: '上午九点见。', pinyin: 'Shàngwǔ jiǔ diǎn jiàn.', en: 'See you at 9 a.m.' }
  ],
  '电脑': [
    { hanzi: '这是我的电脑。', pinyin: 'Zhè shì wǒ de diànnǎo.', en: 'This is my computer.' },
    { hanzi: '我的电脑很小。', pinyin: 'Wǒ de diànnǎo hěn xiǎo.', en: 'My computer is small.' },
    { hanzi: '你的电脑在哪儿？', pinyin: 'Nǐ de diànnǎo zài nǎr?', en: 'Where is your computer?' }
  ],
  '电视': [
    { hanzi: '我看电视。', pinyin: 'Wǒ kàn diànshì.', en: 'I watch TV.' },
    { hanzi: '我喜欢看电视。', pinyin: 'Wǒ xǐhuan kàn diànshì.', en: 'I like watching TV.' },
    { hanzi: '爸爸在看电视。', pinyin: 'Bàba zài kàn diànshì.', en: 'Dad is watching TV.' }
  ],
  '电影': [
    { hanzi: '我们看电影。', pinyin: 'Wǒmen kàn diànyǐng.', en: 'We watch a movie.' },
    { hanzi: '这个电影很好。', pinyin: 'Zhège diànyǐng hěn hǎo.', en: 'This movie is good.' },
    { hanzi: '昨天我看了电影。', pinyin: 'Zuótiān wǒ kàn le diànyǐng.', en: 'Yesterday I watched a movie.' }
  ],
  '东西': [
    { hanzi: '我买东西。', pinyin: 'Wǒ mǎi dōngxi.', en: 'I buy things.' },
    { hanzi: '这是什么东西？', pinyin: 'Zhè shì shénme dōngxi?', en: 'What is this thing?' },
    { hanzi: '我去商店买东西。', pinyin: 'Wǒ qù shāngdiàn mǎi dōngxi.', en: 'I go to the shop to buy things.' }
  ],
  '都': [
    { hanzi: '我们都是学生。', pinyin: 'Wǒmen dōu shì xuésheng.', en: 'We are all students.' },
    { hanzi: '他们都来了。', pinyin: 'Tāmen dōu lái le.', en: 'They all came.' },
    { hanzi: '这些都是我的。', pinyin: 'Zhèxiē dōu shì wǒ de.', en: 'These are all mine.' }
  ],
  '读': [
    { hanzi: '我读书。', pinyin: 'Wǒ dú shū.', en: 'I read books.' },
    { hanzi: '请读这本书。', pinyin: 'Qǐng dú zhè běn shū.', en: 'Please read this book.' },
    { hanzi: '他在读汉语书。', pinyin: 'Tā zài dú Hànyǔ shū.', en: 'He is reading a Chinese book.' }
  ],
  '对不起': [
    { hanzi: '对不起，老师。', pinyin: 'Duìbuqǐ, lǎoshī.', en: 'Sorry, teacher.' },
    { hanzi: '对不起！没关系。', pinyin: 'Duìbuqǐ! Méi guānxi.', en: "Sorry! It's okay." },
    { hanzi: '对不起，我不能去。', pinyin: 'Duìbuqǐ, wǒ bù néng qù.', en: "Sorry, I can't go." }
  ],
  '多': [
    { hanzi: '这里人很多。', pinyin: 'Zhèlǐ rén hěn duō.', en: 'There are many people here.' },
    { hanzi: '你有很多书。', pinyin: 'Nǐ yǒu hěn duō shū.', en: 'You have many books.' },
    { hanzi: '商店里东西很多。', pinyin: 'Shāngdiàn lǐ dōngxi hěn duō.', en: 'There are many things in the shop.' }
  ],
  '多少': [
    { hanzi: '这个多少钱？', pinyin: 'Zhège duōshao qián?', en: 'How much is this?' },
    { hanzi: '你有多少书？', pinyin: 'Nǐ yǒu duōshao shū?', en: 'How many books do you have?' },
    { hanzi: '这些菜多少钱？', pinyin: 'Zhèxiē cài duōshao qián?', en: 'How much are these dishes?' }
  ],
  '儿子': [
    { hanzi: '他是我的儿子。', pinyin: 'Tā shì wǒ de érzi.', en: 'He is my son.' },
    { hanzi: '我儿子五岁。', pinyin: 'Wǒ érzi wǔ suì.', en: 'My son is five.' },
    { hanzi: '她的儿子是学生。', pinyin: 'Tā de érzi shì xuésheng.', en: 'Her son is a student.' }
  ],
  '二': [
    { hanzi: '我有二十块钱。', pinyin: 'Wǒ yǒu èrshí kuài qián.', en: 'I have twenty yuan.' },
    { hanzi: '今天二号。', pinyin: 'Jīntiān èr hào.', en: 'Today is the 2nd.' },
    { hanzi: '二月很冷。', pinyin: 'Èr yuè hěn lěng.', en: 'February is cold.' }
  ],
  '饭店': [
    { hanzi: '我们去饭店吃饭。', pinyin: 'Wǒmen qù fàndiàn chī fàn.', en: 'We go to the restaurant to eat.' },
    { hanzi: '这个饭店很大。', pinyin: 'Zhège fàndiàn hěn dà.', en: 'This restaurant is big.' },
    { hanzi: '饭店在哪儿？', pinyin: 'Fàndiàn zài nǎr?', en: 'Where is the restaurant?' }
  ],
  '飞机': [
    { hanzi: '我坐飞机去北京。', pinyin: 'Wǒ zuò fēijī qù Běijīng.', en: 'I take a plane to Beijing.' },
    { hanzi: '那是飞机。', pinyin: 'Nà shì fēijī.', en: 'That is an airplane.' },
    { hanzi: '明天我坐飞机。', pinyin: 'Míngtiān wǒ zuò fēijī.', en: 'Tomorrow I take a plane.' }
  ],
  '分钟': [
    { hanzi: '我们学习了二十分钟。', pinyin: 'Wǒmen xuéxí le èrshí fēnzhōng.', en: 'We studied for twenty minutes.' },
    { hanzi: '我看了三十分钟电视。', pinyin: 'Wǒ kàn le sānshí fēnzhōng diànshì.', en: 'I watched TV for thirty minutes.' },
    { hanzi: '我们说了几分钟。', pinyin: 'Wǒmen shuō le jǐ fēnzhōng.', en: 'We talked for a few minutes.' }
  ],
  '高兴': [
    { hanzi: '我很高兴。', pinyin: 'Wǒ hěn gāoxìng.', en: "I'm very happy." },
    { hanzi: '认识你我很高兴。', pinyin: 'Rènshi nǐ wǒ hěn gāoxìng.', en: "I'm glad to meet you." },
    { hanzi: '今天她很高兴。', pinyin: 'Jīntiān tā hěn gāoxìng.', en: 'She is happy today.' }
  ],
  '个': [
    { hanzi: '我有三个朋友。', pinyin: 'Wǒ yǒu sān gè péngyou.', en: 'I have three friends.' },
    { hanzi: '这个很好。', pinyin: 'Zhège hěn hǎo.', en: 'This one is good.' },
    { hanzi: '我想买一个杯子。', pinyin: 'Wǒ xiǎng mǎi yí gè bēizi.', en: 'I want to buy a cup.' }
  ],
  '工作': [
    { hanzi: '我喜欢我的工作。', pinyin: 'Wǒ xǐhuan wǒ de gōngzuò.', en: 'I like my job.' },
    { hanzi: '爸爸在工作。', pinyin: 'Bàba zài gōngzuò.', en: 'Dad is working.' },
    { hanzi: '你做什么工作？', pinyin: 'Nǐ zuò shénme gōngzuò?', en: 'What work do you do?' }
  ],
  '狗': [
    { hanzi: '这是我的狗。', pinyin: 'Zhè shì wǒ de gǒu.', en: 'This is my dog.' },
    { hanzi: '我喜欢小狗。', pinyin: 'Wǒ xǐhuan xiǎo gǒu.', en: 'I like puppies.' },
    { hanzi: '狗在家里。', pinyin: 'Gǒu zài jiā lǐ.', en: 'The dog is at home.' }
  ],
  '汉语': [
    { hanzi: '我学习汉语。', pinyin: 'Wǒ xuéxí Hànyǔ.', en: 'I study Chinese.' },
    { hanzi: '汉语很有意思。', pinyin: 'Hànyǔ hěn yǒu yìsi.', en: 'Chinese is interesting.' },
    { hanzi: '他会说汉语。', pinyin: 'Tā huì shuō Hànyǔ.', en: 'He can speak Chinese.' }
  ],
  '好': [
    { hanzi: '你好吗？', pinyin: 'Nǐ hǎo ma?', en: 'How are you?' },
    { hanzi: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', en: 'The weather is nice today.' },
    { hanzi: '他是个好人。', pinyin: 'Tā shì gè hǎo rén.', en: 'He is a good person.' }
  ],
  '号': [
    { hanzi: '今天几号？', pinyin: 'Jīntiān jǐ hào?', en: "What's the date today?" },
    { hanzi: '今天八号。', pinyin: 'Jīntiān bā hào.', en: 'Today is the 8th.' },
    { hanzi: '我的生日是三号。', pinyin: 'Wǒ de shēngrì shì sān hào.', en: 'My birthday is the 3rd.' }
  ],
  '喝': [
    { hanzi: '我喝水。', pinyin: 'Wǒ hē shuǐ.', en: 'I drink water.' },
    { hanzi: '你想喝什么？', pinyin: 'Nǐ xiǎng hē shénme?', en: 'What do you want to drink?' },
    { hanzi: '请喝茶。', pinyin: 'Qǐng hē chá.', en: 'Please have some tea.' }
  ],
  '和': [
    { hanzi: '我和朋友看电影。', pinyin: 'Wǒ hé péngyou kàn diànyǐng.', en: 'My friend and I watch a movie.' },
    { hanzi: '爸爸和妈妈都在家。', pinyin: 'Bàba hé māma dōu zài jiā.', en: 'Dad and mom are both home.' },
    { hanzi: '我喜欢茶和水果。', pinyin: 'Wǒ xǐhuan chá hé shuǐguǒ.', en: 'I like tea and fruit.' }
  ],
  '很': [
    { hanzi: '今天很热。', pinyin: 'Jīntiān hěn rè.', en: 'Today is very hot.' },
    { hanzi: '我很好。', pinyin: 'Wǒ hěn hǎo.', en: "I'm very well." },
    { hanzi: '这本书很有意思。', pinyin: 'Zhè běn shū hěn yǒu yìsi.', en: 'This book is very interesting.' }
  ],
  '后面': [
    { hanzi: '学校在后面。', pinyin: 'Xuéxiào zài hòumiàn.', en: 'The school is behind.' },
    { hanzi: '猫在椅子后面。', pinyin: 'Māo zài yǐzi hòumiàn.', en: 'The cat is behind the chair.' },
    { hanzi: '商店在饭店后面。', pinyin: 'Shāngdiàn zài fàndiàn hòumiàn.', en: 'The shop is behind the restaurant.' }
  ],
  '回': [
    { hanzi: '我回家。', pinyin: 'Wǒ huí jiā.', en: 'I go home.' },
    { hanzi: '他明天回北京。', pinyin: 'Tā míngtiān huí Běijīng.', en: 'He returns to Beijing tomorrow.' },
    { hanzi: '你几点回家？', pinyin: 'Nǐ jǐ diǎn huí jiā?', en: 'What time do you go home?' }
  ],
  '会': [
    { hanzi: '我会说汉语。', pinyin: 'Wǒ huì shuō Hànyǔ.', en: 'I can speak Chinese.' },
    { hanzi: '他会写字。', pinyin: 'Tā huì xiě zì.', en: 'He can write characters.' },
    { hanzi: '你会做菜吗？', pinyin: 'Nǐ huì zuò cài ma?', en: 'Can you cook?' }
  ],
  '火车站': [
    { hanzi: '火车站在哪儿？', pinyin: 'Huǒchēzhàn zài nǎr?', en: 'Where is the train station?' },
    { hanzi: '我去火车站。', pinyin: 'Wǒ qù huǒchēzhàn.', en: 'I go to the train station.' },
    { hanzi: '火车站前面有商店。', pinyin: 'Huǒchēzhàn qiánmiàn yǒu shāngdiàn.', en: 'There are shops in front of the station.' }
  ],
  '几': [
    { hanzi: '你有几本书？', pinyin: 'Nǐ yǒu jǐ běn shū?', en: 'How many books do you have?' },
    { hanzi: '现在几点？', pinyin: 'Xiànzài jǐ diǎn?', en: 'What time is it?' },
    { hanzi: '你家有几个人？', pinyin: 'Nǐ jiā yǒu jǐ gè rén?', en: 'How many people are in your family?' }
  ],
  '家': [
    { hanzi: '我家很大。', pinyin: 'Wǒ jiā hěn dà.', en: 'My home is big.' },
    { hanzi: '我在家。', pinyin: 'Wǒ zài jiā.', en: "I'm at home." },
    { hanzi: '你家有几口人？', pinyin: 'Nǐ jiā yǒu jǐ gè rén?', en: 'How many people are in your family?' }
  ],
  '叫': [
    { hanzi: '我叫王明。', pinyin: 'Wǒ jiào Wáng Míng.', en: 'My name is Wang Ming.' },
    { hanzi: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', en: 'What is your name?' },
    { hanzi: '这个狗叫什么？', pinyin: 'Zhège gǒu jiào shénme?', en: "What's this dog called?" }
  ],
  '今天': [
    { hanzi: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', en: 'The weather is nice today.' },
    { hanzi: '今天几号？', pinyin: 'Jīntiān jǐ hào?', en: "What's the date today?" },
    { hanzi: '今天我很高兴。', pinyin: 'Jīntiān wǒ hěn gāoxìng.', en: "I'm happy today." }
  ],
  '九': [
    { hanzi: '现在九点。', pinyin: 'Xiànzài jiǔ diǎn.', en: "It's nine o'clock." },
    { hanzi: '我有九块钱。', pinyin: 'Wǒ yǒu jiǔ kuài qián.', en: 'I have nine yuan.' },
    { hanzi: '他九岁了。', pinyin: 'Tā jiǔ suì le.', en: 'He is nine years old.' }
  ],
  '开': [
    { hanzi: '商店九点开。', pinyin: 'Shāngdiàn jiǔ diǎn kāi.', en: 'The shop opens at nine.' },
    { hanzi: '请开门。', pinyin: 'Qǐng kāi mén.', en: 'Please open the door.' },
    { hanzi: '我会开车。', pinyin: 'Wǒ huì kāi chē.', en: 'I can drive.' }
  ],
  '看': [
    { hanzi: '我看书。', pinyin: 'Wǒ kàn shū.', en: 'I read a book.' },
    { hanzi: '我们看电影。', pinyin: 'Wǒmen kàn diànyǐng.', en: 'We watch a movie.' },
    { hanzi: '你看，那是我家。', pinyin: 'Nǐ kàn, nà shì wǒ jiā.', en: "Look, that's my home." }
  ],
  '看见': [
    { hanzi: '我看见他了。', pinyin: 'Wǒ kànjiàn tā le.', en: 'I saw him.' },
    { hanzi: '你看见我的书了吗？', pinyin: 'Nǐ kànjiàn wǒ de shū le ma?', en: 'Did you see my book?' },
    { hanzi: '我在商店看见了老师。', pinyin: 'Wǒ zài shāngdiàn kànjiàn le lǎoshī.', en: 'I saw the teacher at the shop.' }
  ],
  '块': [
    { hanzi: '这个五块钱。', pinyin: 'Zhège wǔ kuài qián.', en: 'This is five yuan.' },
    { hanzi: '茶多少块钱？', pinyin: 'Chá duōshao kuài qián?', en: 'How many yuan is the tea?' },
    { hanzi: '我有十块钱。', pinyin: 'Wǒ yǒu shí kuài qián.', en: 'I have ten yuan.' }
  ],
  '来': [
    { hanzi: '他来我家。', pinyin: 'Tā lái wǒ jiā.', en: 'He comes to my home.' },
    { hanzi: '你什么时候来？', pinyin: 'Nǐ shénme shíhou lái?', en: 'When are you coming?' },
    { hanzi: '老师来了。', pinyin: 'Lǎoshī lái le.', en: 'The teacher has come.' }
  ],
  '老师': [
    { hanzi: '我的老师很好。', pinyin: 'Wǒ de lǎoshī hěn hǎo.', en: 'My teacher is nice.' },
    { hanzi: '老师，再见！', pinyin: 'Lǎoshī, zàijiàn!', en: 'Goodbye, teacher!' },
    { hanzi: '她是汉语老师。', pinyin: 'Tā shì Hànyǔ lǎoshī.', en: 'She is a Chinese teacher.' }
  ],
  '了': [
    { hanzi: '我吃饭了。', pinyin: 'Wǒ chī fàn le.', en: 'I have eaten.' },
    { hanzi: '他回家了。', pinyin: 'Tā huí jiā le.', en: 'He went home.' },
    { hanzi: '现在太晚了。', pinyin: 'Xiànzài tài wǎn le.', en: "It's too late now." }
  ],
  '冷': [
    { hanzi: '今天很冷。', pinyin: 'Jīntiān hěn lěng.', en: 'Today is cold.' },
    { hanzi: '北京冬天很冷。', pinyin: 'Běijīng dōngtiān hěn lěng.', en: 'Beijing is cold in winter.' },
    { hanzi: '水太冷了。', pinyin: 'Shuǐ tài lěng le.', en: 'The water is too cold.' }
  ],
  '里': [
    { hanzi: '书在家里。', pinyin: 'Shū zài jiā lǐ.', en: 'The book is at home.' },
    { hanzi: '杯子里有水。', pinyin: 'Bēizi lǐ yǒu shuǐ.', en: "There's water in the cup." },
    { hanzi: '猫在商店里。', pinyin: 'Māo zài shāngdiàn lǐ.', en: 'The cat is in the shop.' }
  ],
  '六': [
    { hanzi: '现在六点。', pinyin: 'Xiànzài liù diǎn.', en: "It's six o'clock." },
    { hanzi: '我有六本书。', pinyin: 'Wǒ yǒu liù běn shū.', en: 'I have six books.' },
    { hanzi: '他六岁了。', pinyin: 'Tā liù suì le.', en: 'He is six years old.' }
  ],
  '妈妈': [
    { hanzi: '我妈妈很漂亮。', pinyin: 'Wǒ māma hěn piàoliang.', en: 'My mom is pretty.' },
    { hanzi: '妈妈在做菜。', pinyin: 'Māma zài zuò cài.', en: 'Mom is cooking.' },
    { hanzi: '我爱我的妈妈。', pinyin: 'Wǒ ài wǒ de māma.', en: 'I love my mom.' }
  ],
  '吗': [
    { hanzi: '你是学生吗？', pinyin: 'Nǐ shì xuésheng ma?', en: 'Are you a student?' },
    { hanzi: '你好吗？', pinyin: 'Nǐ hǎo ma?', en: 'How are you?' },
    { hanzi: '你会说汉语吗？', pinyin: 'Nǐ huì shuō Hànyǔ ma?', en: 'Can you speak Chinese?' }
  ],
  '买': [
    { hanzi: '我买苹果。', pinyin: 'Wǒ mǎi píngguǒ.', en: 'I buy apples.' },
    { hanzi: '我想买一本书。', pinyin: 'Wǒ xiǎng mǎi yì běn shū.', en: 'I want to buy a book.' },
    { hanzi: '妈妈去商店买东西。', pinyin: 'Māma qù shāngdiàn mǎi dōngxi.', en: 'Mom goes to the shop to buy things.' }
  ],
  '猫': [
    { hanzi: '我喜欢猫。', pinyin: 'Wǒ xǐhuan māo.', en: 'I like cats.' },
    { hanzi: '猫在桌子下。', pinyin: 'Māo zài zhuōzi xià.', en: 'The cat is under the table.' },
    { hanzi: '这是谁的猫？', pinyin: 'Zhè shì shéi de māo?', en: 'Whose cat is this?' }
  ],
  '没关系': [
    { hanzi: '没关系，谢谢你。', pinyin: 'Méi guānxi, xièxie nǐ.', en: "It's okay, thank you." },
    { hanzi: '对不起！没关系。', pinyin: 'Duìbuqǐ! Méi guānxi.', en: "Sorry! It's okay." },
    { hanzi: '没关系，我有时间。', pinyin: 'Méi guānxi, wǒ yǒu shíjiān.', en: "It's okay, I have time." }
  ],
  '没有': [
    { hanzi: '我没有钱。', pinyin: 'Wǒ méiyǒu qián.', en: "I don't have money." },
    { hanzi: '家里没有茶了。', pinyin: 'Jiā lǐ méiyǒu chá le.', en: "There's no more tea at home." },
    { hanzi: '他没有电脑。', pinyin: 'Tā méiyǒu diànnǎo.', en: "He doesn't have a computer." }
  ],
  '米饭': [
    { hanzi: '我喜欢吃米饭。', pinyin: 'Wǒ xǐhuan chī mǐfàn.', en: 'I like to eat rice.' },
    { hanzi: '中午我吃米饭。', pinyin: 'Zhōngwǔ wǒ chī mǐfàn.', en: 'I eat rice at noon.' },
    { hanzi: '这个米饭很好吃。', pinyin: 'Zhège mǐfàn hěn hǎochī.', en: 'This rice is delicious.' }
  ],
  '名字': [
    { hanzi: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', en: 'What is your name?' },
    { hanzi: '我的名字很好记。', pinyin: 'Wǒ de míngzi hěn hǎo jì.', en: 'My name is easy to remember.' },
    { hanzi: '这是谁的名字？', pinyin: 'Zhè shì shéi de míngzi?', en: 'Whose name is this?' }
  ],
  '明天': [
    { hanzi: '明天见。', pinyin: 'Míngtiān jiàn.', en: 'See you tomorrow.' },
    { hanzi: '明天是星期一。', pinyin: 'Míngtiān shì xīngqīyī.', en: 'Tomorrow is Monday.' },
    { hanzi: '明天我去北京。', pinyin: 'Míngtiān wǒ qù Běijīng.', en: 'Tomorrow I go to Beijing.' }
  ],
  '哪': [
    { hanzi: '你是哪国人？', pinyin: 'Nǐ shì nǎ guó rén?', en: 'What country are you from?' },
    { hanzi: '你想看哪个电影？', pinyin: 'Nǐ xiǎng kàn nǎge diànyǐng?', en: 'Which movie do you want to watch?' },
    { hanzi: '哪本书是你的？', pinyin: 'Nǎ běn shū shì nǐ de?', en: 'Which book is yours?' }
  ],
  '哪儿': [
    { hanzi: '你去哪儿？', pinyin: 'Nǐ qù nǎr?', en: 'Where are you going?' },
    { hanzi: '商店在哪儿？', pinyin: 'Shāngdiàn zài nǎr?', en: 'Where is the shop?' },
    { hanzi: '你在哪儿工作？', pinyin: 'Nǐ zài nǎr gōngzuò?', en: 'Where do you work?' }
  ],
  '那': [
    { hanzi: '那是什么？', pinyin: 'Nà shì shénme?', en: 'What is that?' },
    { hanzi: '那是我的老师。', pinyin: 'Nà shì wǒ de lǎoshī.', en: 'That is my teacher.' },
    { hanzi: '那本书很好。', pinyin: 'Nà běn shū hěn hǎo.', en: 'That book is good.' }
  ],
  '呢': [
    { hanzi: '我很好，你呢？', pinyin: 'Wǒ hěn hǎo, nǐ ne?', en: "I'm fine, and you?" },
    { hanzi: '我的书呢？', pinyin: 'Wǒ de shū ne?', en: 'Where is my book?' },
    { hanzi: '妈妈在家，爸爸呢？', pinyin: 'Māma zài jiā, bàba ne?', en: 'Mom is home, and dad?' }
  ],
  '能': [
    { hanzi: '我能喝水吗？', pinyin: 'Wǒ néng hē shuǐ ma?', en: 'Can I drink water?' },
    { hanzi: '你能来吗？', pinyin: 'Nǐ néng lái ma?', en: 'Can you come?' },
    { hanzi: '我明天不能去。', pinyin: 'Wǒ míngtiān bù néng qù.', en: "I can't go tomorrow." }
  ],
  '你': [
    { hanzi: '你好！', pinyin: 'Nǐ hǎo!', en: 'Hello!' },
    { hanzi: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', en: 'What is your name?' },
    { hanzi: '我爱你。', pinyin: 'Wǒ ài nǐ.', en: 'I love you.' }
  ],
  '年': [
    { hanzi: '我学习汉语一年了。', pinyin: 'Wǒ xuéxí Hànyǔ yì nián le.', en: "I've studied Chinese for a year." },
    { hanzi: '明年我去中国。', pinyin: 'Míngnián wǒ qù Zhōngguó.', en: "Next year I'll go to China." },
    { hanzi: '今年我二十岁。', pinyin: 'Jīnnián wǒ èrshí suì.', en: "I'm twenty this year." }
  ],
  '女儿': [
    { hanzi: '这是我的女儿。', pinyin: "Zhè shì wǒ de nǚ'ér.", en: 'This is my daughter.' },
    { hanzi: '我女儿会说汉语。', pinyin: "Wǒ nǚ'ér huì shuō Hànyǔ.", en: 'My daughter can speak Chinese.' },
    { hanzi: '她的女儿很漂亮。', pinyin: "Tā de nǚ'ér hěn piàoliang.", en: 'Her daughter is pretty.' }
  ],
  '朋友': [
    { hanzi: '他是我的朋友。', pinyin: 'Tā shì wǒ de péngyou.', en: 'He is my friend.' },
    { hanzi: '我有很多朋友。', pinyin: 'Wǒ yǒu hěn duō péngyou.', en: 'I have many friends.' },
    { hanzi: '我和朋友去看电影。', pinyin: 'Wǒ hé péngyou qù kàn diànyǐng.', en: 'My friend and I go to a movie.' }
  ],
  '漂亮': [
    { hanzi: '她很漂亮。', pinyin: 'Tā hěn piàoliang.', en: 'She is pretty.' },
    { hanzi: '这件衣服很漂亮。', pinyin: 'Zhè jiàn yīfu hěn piàoliang.', en: 'This clothing is pretty.' },
    { hanzi: '北京很漂亮。', pinyin: 'Běijīng hěn piàoliang.', en: 'Beijing is beautiful.' }
  ],
  '苹果': [
    { hanzi: '我喜欢吃苹果。', pinyin: 'Wǒ xǐhuan chī píngguǒ.', en: 'I like to eat apples.' },
    { hanzi: '这个苹果很大。', pinyin: 'Zhège píngguǒ hěn dà.', en: 'This apple is big.' },
    { hanzi: '我想买几个苹果。', pinyin: 'Wǒ xiǎng mǎi jǐ gè píngguǒ.', en: 'I want to buy a few apples.' }
  ],
  '七': [
    { hanzi: '现在七点。', pinyin: 'Xiànzài qī diǎn.', en: "It's seven o'clock." },
    { hanzi: '我有七块钱。', pinyin: 'Wǒ yǒu qī kuài qián.', en: 'I have seven yuan.' },
    { hanzi: '一个星期有七天。', pinyin: 'Yí gè xīngqī yǒu qī tiān.', en: 'A week has seven days.' }
  ],
  '钱': [
    { hanzi: '我有一点儿钱。', pinyin: 'Wǒ yǒu yìdiǎnr qián.', en: 'I have a little money.' },
    { hanzi: '这个多少钱？', pinyin: 'Zhège duōshao qián?', en: 'How much is this?' },
    { hanzi: '我没有钱了。', pinyin: 'Wǒ méiyǒu qián le.', en: 'I have no money left.' }
  ],
  '前面': [
    { hanzi: '商店在前面。', pinyin: 'Shāngdiàn zài qiánmiàn.', en: 'The shop is in front.' },
    { hanzi: '前面有一个饭店。', pinyin: 'Qiánmiàn yǒu yí gè fàndiàn.', en: "There's a restaurant ahead." },
    { hanzi: '老师在前面。', pinyin: 'Lǎoshī zài qiánmiàn.', en: 'The teacher is in front.' }
  ],
  '请': [
    { hanzi: '请喝茶。', pinyin: 'Qǐng hē chá.', en: 'Please drink tea.' },
    { hanzi: '请坐。', pinyin: 'Qǐng zuò.', en: 'Please sit.' },
    { hanzi: '请说汉语。', pinyin: 'Qǐng shuō Hànyǔ.', en: 'Please speak Chinese.' }
  ],
  '去': [
    { hanzi: '我去学校。', pinyin: 'Wǒ qù xuéxiào.', en: 'I go to school.' },
    { hanzi: '你去哪儿？', pinyin: 'Nǐ qù nǎr?', en: 'Where are you going?' },
    { hanzi: '明天我们去北京。', pinyin: 'Míngtiān wǒmen qù Běijīng.', en: 'Tomorrow we go to Beijing.' }
  ],
  '热': [
    { hanzi: '茶很热。', pinyin: 'Chá hěn rè.', en: 'The tea is hot.' },
    { hanzi: '今天天气很热。', pinyin: 'Jīntiān tiānqì hěn rè.', en: 'The weather is hot today.' },
    { hanzi: '夏天很热。', pinyin: 'Xiàtiān hěn rè.', en: 'Summer is hot.' }
  ],
  '人': [
    { hanzi: '他是好人。', pinyin: 'Tā shì hǎo rén.', en: 'He is a good person.' },
    { hanzi: '这里人很多。', pinyin: 'Zhèlǐ rén hěn duō.', en: 'There are many people here.' },
    { hanzi: '我是中国人。', pinyin: 'Wǒ shì Zhōngguó rén.', en: 'I am Chinese.' }
  ],
  '认识': [
    { hanzi: '认识你很高兴。', pinyin: 'Rènshi nǐ hěn gāoxìng.', en: 'Nice to meet you.' },
    { hanzi: '我认识他。', pinyin: 'Wǒ rènshi tā.', en: 'I know him.' },
    { hanzi: '你认识那个老师吗？', pinyin: 'Nǐ rènshi nàge lǎoshī ma?', en: 'Do you know that teacher?' }
  ],
  '三': [
    { hanzi: '我有三个杯子。', pinyin: 'Wǒ yǒu sān gè bēizi.', en: 'I have three cups.' },
    { hanzi: '现在三点。', pinyin: 'Xiànzài sān diǎn.', en: "It's three o'clock." },
    { hanzi: '我们三个人去。', pinyin: 'Wǒmen sān gè rén qù.', en: 'The three of us go.' }
  ],
  '商店': [
    { hanzi: '商店在哪儿？', pinyin: 'Shāngdiàn zài nǎr?', en: 'Where is the shop?' },
    { hanzi: '我去商店买东西。', pinyin: 'Wǒ qù shāngdiàn mǎi dōngxi.', en: 'I go to the shop to buy things.' },
    { hanzi: '这个商店很大。', pinyin: 'Zhège shāngdiàn hěn dà.', en: 'This shop is big.' }
  ],
  '上': [
    { hanzi: '书在桌子上。', pinyin: 'Shū zài zhuōzi shàng.', en: 'The book is on the table.' },
    { hanzi: '猫在椅子上。', pinyin: 'Māo zài yǐzi shàng.', en: 'The cat is on the chair.' },
    { hanzi: '杯子在桌子上。', pinyin: 'Bēizi zài zhuōzi shàng.', en: 'The cup is on the table.' }
  ],
  '上午': [
    { hanzi: '上午我去学校。', pinyin: 'Shàngwǔ wǒ qù xuéxiào.', en: 'I go to school in the morning.' },
    { hanzi: '上午九点见。', pinyin: 'Shàngwǔ jiǔ diǎn jiàn.', en: 'See you at 9 a.m.' },
    { hanzi: '今天上午很忙。', pinyin: 'Jīntiān shàngwǔ hěn máng.', en: 'This morning is busy.' }
  ],
  '少': [
    { hanzi: '这里人很少。', pinyin: 'Zhèlǐ rén hěn shǎo.', en: 'There are few people here.' },
    { hanzi: '我的钱很少。', pinyin: 'Wǒ de qián hěn shǎo.', en: 'I have little money.' },
    { hanzi: '今天作业很少。', pinyin: 'Jīntiān zuòyè hěn shǎo.', en: "There's little homework today." }
  ],
  '谁': [
    { hanzi: '他是谁？', pinyin: 'Tā shì shéi?', en: 'Who is he?' },
    { hanzi: '这是谁的书？', pinyin: 'Zhè shì shéi de shū?', en: 'Whose book is this?' },
    { hanzi: '谁会说汉语？', pinyin: 'Shéi huì shuō Hànyǔ?', en: 'Who can speak Chinese?' }
  ],
  '什么': [
    { hanzi: '这是什么？', pinyin: 'Zhè shì shénme?', en: 'What is this?' },
    { hanzi: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', en: 'What is your name?' },
    { hanzi: '你想吃什么？', pinyin: 'Nǐ xiǎng chī shénme?', en: 'What do you want to eat?' }
  ],
  '十': [
    { hanzi: '我有十块钱。', pinyin: 'Wǒ yǒu shí kuài qián.', en: 'I have ten yuan.' },
    { hanzi: '现在十点。', pinyin: 'Xiànzài shí diǎn.', en: "It's ten o'clock." },
    { hanzi: '他十岁了。', pinyin: 'Tā shí suì le.', en: 'He is ten years old.' }
  ],
  '时候': [
    { hanzi: '你什么时候来？', pinyin: 'Nǐ shénme shíhou lái?', en: 'When are you coming?' },
    { hanzi: '小的时候我住在北京。', pinyin: 'Xiǎo de shíhou wǒ zhù zài Běijīng.', en: 'When I was little I lived in Beijing.' },
    { hanzi: '什么时候吃饭？', pinyin: 'Shénme shíhou chī fàn?', en: 'When do we eat?' }
  ],
  '是': [
    { hanzi: '我是学生。', pinyin: 'Wǒ shì xuésheng.', en: 'I am a student.' },
    { hanzi: '他是我的朋友。', pinyin: 'Tā shì wǒ de péngyou.', en: 'He is my friend.' },
    { hanzi: '这是什么？', pinyin: 'Zhè shì shénme?', en: 'What is this?' }
  ],
  '书': [
    { hanzi: '这本书很好。', pinyin: 'Zhè běn shū hěn hǎo.', en: 'This book is good.' },
    { hanzi: '我喜欢读书。', pinyin: 'Wǒ xǐhuan dú shū.', en: 'I like reading.' },
    { hanzi: '书在桌子上。', pinyin: 'Shū zài zhuōzi shàng.', en: 'The book is on the table.' }
  ],
  '水': [
    { hanzi: '我想喝水。', pinyin: 'Wǒ xiǎng hē shuǐ.', en: 'I want to drink water.' },
    { hanzi: '杯子里有水。', pinyin: 'Bēizi lǐ yǒu shuǐ.', en: "There's water in the cup." },
    { hanzi: '水很热。', pinyin: 'Shuǐ hěn rè.', en: 'The water is hot.' }
  ],
  '水果': [
    { hanzi: '我喜欢吃水果。', pinyin: 'Wǒ xǐhuan chī shuǐguǒ.', en: 'I like to eat fruit.' },
    { hanzi: '苹果是水果。', pinyin: 'Píngguǒ shì shuǐguǒ.', en: 'Apples are fruit.' },
    { hanzi: '我去买水果。', pinyin: 'Wǒ qù mǎi shuǐguǒ.', en: 'I go to buy fruit.' }
  ],
  '睡觉': [
    { hanzi: '我想睡觉。', pinyin: 'Wǒ xiǎng shuìjiào.', en: 'I want to sleep.' },
    { hanzi: '他在睡觉。', pinyin: 'Tā zài shuìjiào.', en: 'He is sleeping.' },
    { hanzi: '你几点睡觉？', pinyin: 'Nǐ jǐ diǎn shuìjiào?', en: 'What time do you sleep?' }
  ],
  '说': [
    { hanzi: '请说汉语。', pinyin: 'Qǐng shuō Hànyǔ.', en: 'Please speak Chinese.' },
    { hanzi: '他会说汉语。', pinyin: 'Tā huì shuō Hànyǔ.', en: 'He can speak Chinese.' },
    { hanzi: '老师说得很好。', pinyin: 'Lǎoshī shuō de hěn hǎo.', en: 'The teacher speaks well.' }
  ],
  '四': [
    { hanzi: '现在四点。', pinyin: 'Xiànzài sì diǎn.', en: "It's four o'clock." },
    { hanzi: '我有四本书。', pinyin: 'Wǒ yǒu sì běn shū.', en: 'I have four books.' },
    { hanzi: '他家有四个人。', pinyin: 'Tā jiā yǒu sì gè rén.', en: 'His family has four people.' }
  ],
  '岁': [
    { hanzi: '我儿子三岁。', pinyin: 'Wǒ érzi sān suì.', en: 'My son is three years old.' },
    { hanzi: '你几岁了？', pinyin: 'Nǐ jǐ suì le?', en: 'How old are you?' },
    { hanzi: '她今年二十岁。', pinyin: 'Tā jīnnián èrshí suì.', en: "She's twenty this year." }
  ],
  '他': [
    { hanzi: '他是医生。', pinyin: 'Tā shì yīshēng.', en: 'He is a doctor.' },
    { hanzi: '他在家吗？', pinyin: 'Tā zài jiā ma?', en: 'Is he home?' },
    { hanzi: '他是我的朋友。', pinyin: 'Tā shì wǒ de péngyou.', en: 'He is my friend.' }
  ],
  '她': [
    { hanzi: '她是老师。', pinyin: 'Tā shì lǎoshī.', en: 'She is a teacher.' },
    { hanzi: '她很漂亮。', pinyin: 'Tā hěn piàoliang.', en: 'She is pretty.' },
    { hanzi: '她会说汉语。', pinyin: 'Tā huì shuō Hànyǔ.', en: 'She can speak Chinese.' }
  ],
  '太': [
    { hanzi: '太好了！', pinyin: 'Tài hǎo le!', en: 'Wonderful!' },
    { hanzi: '这个太大了。', pinyin: 'Zhège tài dà le.', en: 'This is too big.' },
    { hanzi: '今天太热了。', pinyin: 'Jīntiān tài rè le.', en: "It's too hot today." }
  ],
  '天气': [
    { hanzi: '北京的天气很热。', pinyin: 'Běijīng de tiānqì hěn rè.', en: "Beijing's weather is hot." },
    { hanzi: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', en: 'The weather is nice today.' },
    { hanzi: '明天天气怎么样？', pinyin: 'Míngtiān tiānqì zěnmeyàng?', en: "How's the weather tomorrow?" }
  ],
  '听': [
    { hanzi: '我听老师说。', pinyin: 'Wǒ tīng lǎoshī shuō.', en: 'I listen to the teacher.' },
    { hanzi: '我喜欢听。', pinyin: 'Wǒ xǐhuan tīng.', en: 'I like listening.' },
    { hanzi: '请听我说。', pinyin: 'Qǐng tīng wǒ shuō.', en: 'Please listen to me.' }
  ],
  '同学': [
    { hanzi: '他是我的同学。', pinyin: 'Tā shì wǒ de tóngxué.', en: 'He is my classmate.' },
    { hanzi: '同学们都来了。', pinyin: 'Tóngxuémen dōu lái le.', en: 'The classmates all came.' },
    { hanzi: '我和同学去学校。', pinyin: 'Wǒ hé tóngxué qù xuéxiào.', en: 'My classmate and I go to school.' }
  ],
  '喂': [
    { hanzi: '喂，你好！', pinyin: 'Wéi, nǐ hǎo!', en: 'Hello? (on the phone)' },
    { hanzi: '喂，请问你是谁？', pinyin: 'Wéi, qǐngwèn nǐ shì shéi?', en: 'Hello, who is this please?' },
    { hanzi: '喂，妈妈在家吗？', pinyin: 'Wéi, māma zài jiā ma?', en: 'Hello, is mom home?' }
  ],
  '我': [
    { hanzi: '我是中国人。', pinyin: 'Wǒ shì Zhōngguó rén.', en: 'I am Chinese.' },
    { hanzi: '我喜欢喝茶。', pinyin: 'Wǒ xǐhuan hē chá.', en: 'I like drinking tea.' },
    { hanzi: '我叫王明。', pinyin: 'Wǒ jiào Wáng Míng.', en: 'My name is Wang Ming.' }
  ],
  '我们': [
    { hanzi: '我们是朋友。', pinyin: 'Wǒmen shì péngyou.', en: 'We are friends.' },
    { hanzi: '我们去看电影。', pinyin: 'Wǒmen qù kàn diànyǐng.', en: 'We go to a movie.' },
    { hanzi: '我们都是学生。', pinyin: 'Wǒmen dōu shì xuésheng.', en: 'We are all students.' }
  ],
  '五': [
    { hanzi: '现在五点。', pinyin: 'Xiànzài wǔ diǎn.', en: "It's five o'clock." },
    { hanzi: '我有五块钱。', pinyin: 'Wǒ yǒu wǔ kuài qián.', en: 'I have five yuan.' },
    { hanzi: '他家有五个人。', pinyin: 'Tā jiā yǒu wǔ gè rén.', en: 'His family has five people.' }
  ],
  '喜欢': [
    { hanzi: '我喜欢你。', pinyin: 'Wǒ xǐhuan nǐ.', en: 'I like you.' },
    { hanzi: '我喜欢吃水果。', pinyin: 'Wǒ xǐhuan chī shuǐguǒ.', en: 'I like eating fruit.' },
    { hanzi: '你喜欢什么？', pinyin: 'Nǐ xǐhuan shénme?', en: 'What do you like?' }
  ],
  '下': [
    { hanzi: '猫在桌子下。', pinyin: 'Māo zài zhuōzi xià.', en: 'The cat is under the table.' },
    { hanzi: '书在椅子下面。', pinyin: 'Shū zài yǐzi xiàmiàn.', en: 'The book is under the chair.' },
    { hanzi: '我下午去。', pinyin: 'Wǒ xiàwǔ qù.', en: 'I go in the afternoon.' }
  ],
  '下午': [
    { hanzi: '下午我去商店。', pinyin: 'Xiàwǔ wǒ qù shāngdiàn.', en: 'In the afternoon I go to the shop.' },
    { hanzi: '下午三点见。', pinyin: 'Xiàwǔ sān diǎn jiàn.', en: 'See you at 3 p.m.' },
    { hanzi: '今天下午很热。', pinyin: 'Jīntiān xiàwǔ hěn rè.', en: "It's hot this afternoon." }
  ],
  '下雨': [
    { hanzi: '今天下雨。', pinyin: 'Jīntiān xiàyǔ.', en: "It's raining today." },
    { hanzi: '明天会下雨吗？', pinyin: 'Míngtiān huì xiàyǔ ma?', en: 'Will it rain tomorrow?' },
    { hanzi: '下雨了，我们回家吧。', pinyin: 'Xiàyǔ le, wǒmen huí jiā ba.', en: "It's raining, let's go home." }
  ],
  '先生': [
    { hanzi: '王先生是医生。', pinyin: 'Wáng xiānsheng shì yīshēng.', en: 'Mr. Wang is a doctor.' },
    { hanzi: '先生，您好。', pinyin: 'Xiānsheng, nín hǎo.', en: 'Hello, sir.' },
    { hanzi: '这位先生是老师。', pinyin: 'Zhè wèi xiānsheng shì lǎoshī.', en: 'This gentleman is a teacher.' }
  ],
  '现在': [
    { hanzi: '现在几点？', pinyin: 'Xiànzài jǐ diǎn?', en: 'What time is it now?' },
    { hanzi: '现在我在家。', pinyin: 'Xiànzài wǒ zài jiā.', en: "I'm at home now." },
    { hanzi: '现在天气很好。', pinyin: 'Xiànzài tiānqì hěn hǎo.', en: 'The weather is nice now.' }
  ],
  '想': [
    { hanzi: '我想喝茶。', pinyin: 'Wǒ xiǎng hē chá.', en: 'I want to drink tea.' },
    { hanzi: '你想去哪儿？', pinyin: 'Nǐ xiǎng qù nǎr?', en: 'Where do you want to go?' },
    { hanzi: '我很想我的家。', pinyin: 'Wǒ hěn xiǎng wǒ de jiā.', en: 'I miss my home a lot.' }
  ],
  '小': [
    { hanzi: '这个杯子很小。', pinyin: 'Zhège bēizi hěn xiǎo.', en: 'This cup is small.' },
    { hanzi: '我有一只小猫。', pinyin: 'Wǒ yǒu yì zhī xiǎo māo.', en: 'I have a little cat.' },
    { hanzi: '他的家很小。', pinyin: 'Tā de jiā hěn xiǎo.', en: 'His home is small.' }
  ],
  '小姐': [
    { hanzi: '李小姐是老师。', pinyin: 'Lǐ xiǎojiě shì lǎoshī.', en: 'Miss Li is a teacher.' },
    { hanzi: '小姐，您好。', pinyin: 'Xiǎojiě, nín hǎo.', en: 'Hello, miss.' },
    { hanzi: '那位小姐很漂亮。', pinyin: 'Nà wèi xiǎojiě hěn piàoliang.', en: 'That young lady is pretty.' }
  ],
  '些': [
    { hanzi: '这些是我的书。', pinyin: 'Zhèxiē shì wǒ de shū.', en: 'These are my books.' },
    { hanzi: '那些人是学生。', pinyin: 'Nàxiē rén shì xuésheng.', en: 'Those people are students.' },
    { hanzi: '我买了一些水果。', pinyin: 'Wǒ mǎi le yìxiē shuǐguǒ.', en: 'I bought some fruit.' }
  ],
  '写': [
    { hanzi: '我会写字。', pinyin: 'Wǒ huì xiě zì.', en: 'I can write characters.' },
    { hanzi: '这个字怎么写？', pinyin: 'Zhège zì zěnme xiě?', en: 'How do you write this character?' },
    { hanzi: '请写你的名字。', pinyin: 'Qǐng xiě nǐ de míngzi.', en: 'Please write your name.' }
  ],
  '谢谢': [
    { hanzi: '谢谢你！', pinyin: 'Xièxie nǐ!', en: 'Thank you!' },
    { hanzi: '谢谢老师。', pinyin: 'Xièxie lǎoshī.', en: 'Thank you, teacher.' },
    { hanzi: '谢谢，再见！', pinyin: 'Xièxie, zàijiàn!', en: 'Thanks, goodbye!' }
  ],
  '星期': [
    { hanzi: '今天星期几？', pinyin: 'Jīntiān xīngqī jǐ?', en: 'What day of the week is it?' },
    { hanzi: '这个星期我很忙。', pinyin: 'Zhège xīngqī wǒ hěn máng.', en: "I'm busy this week." },
    { hanzi: '一个星期有七天。', pinyin: 'Yí gè xīngqī yǒu qī tiān.', en: 'A week has seven days.' }
  ],
  '学生': [
    { hanzi: '他们都是学生。', pinyin: 'Tāmen dōu shì xuésheng.', en: 'They are all students.' },
    { hanzi: '我是汉语学生。', pinyin: 'Wǒ shì Hànyǔ xuésheng.', en: 'I am a Chinese student.' },
    { hanzi: '这个学生很好。', pinyin: 'Zhège xuésheng hěn hǎo.', en: 'This student is good.' }
  ],
  '学习': [
    { hanzi: '我喜欢学习。', pinyin: 'Wǒ xǐhuan xuéxí.', en: 'I like studying.' },
    { hanzi: '我学习汉语。', pinyin: 'Wǒ xuéxí Hànyǔ.', en: 'I study Chinese.' },
    { hanzi: '他在家学习。', pinyin: 'Tā zài jiā xuéxí.', en: 'He studies at home.' }
  ],
  '学校': [
    { hanzi: '学校很大。', pinyin: 'Xuéxiào hěn dà.', en: 'The school is big.' },
    { hanzi: '我去学校。', pinyin: 'Wǒ qù xuéxiào.', en: 'I go to school.' },
    { hanzi: '学校在前面。', pinyin: 'Xuéxiào zài qiánmiàn.', en: 'The school is ahead.' }
  ],
  '一': [
    { hanzi: '我有一个苹果。', pinyin: 'Wǒ yǒu yí gè píngguǒ.', en: 'I have one apple.' },
    { hanzi: '请给我一杯水。', pinyin: 'Qǐng gěi wǒ yì bēi shuǐ.', en: 'Please give me a glass of water.' },
    { hanzi: '我买了一本书。', pinyin: 'Wǒ mǎi le yì běn shū.', en: 'I bought one book.' }
  ],
  '衣服': [
    { hanzi: '我买衣服。', pinyin: 'Wǒ mǎi yīfu.', en: 'I buy clothes.' },
    { hanzi: '这件衣服很漂亮。', pinyin: 'Zhè jiàn yīfu hěn piàoliang.', en: 'This clothing is pretty.' },
    { hanzi: '这是谁的衣服？', pinyin: 'Zhè shì shéi de yīfu?', en: 'Whose clothes are these?' }
  ],
  '医生': [
    { hanzi: '我想做医生。', pinyin: 'Wǒ xiǎng zuò yīshēng.', en: 'I want to be a doctor.' },
    { hanzi: '他是好医生。', pinyin: 'Tā shì hǎo yīshēng.', en: 'He is a good doctor.' },
    { hanzi: '医生在医院。', pinyin: 'Yīshēng zài yīyuàn.', en: 'The doctor is at the hospital.' }
  ],
  '医院': [
    { hanzi: '医院在哪儿？', pinyin: 'Yīyuàn zài nǎr?', en: 'Where is the hospital?' },
    { hanzi: '我去医院看医生。', pinyin: 'Wǒ qù yīyuàn kàn yīshēng.', en: 'I go to the hospital to see a doctor.' },
    { hanzi: '这个医院很大。', pinyin: 'Zhège yīyuàn hěn dà.', en: 'This hospital is big.' }
  ],
  '椅子': [
    { hanzi: '这是我的椅子。', pinyin: 'Zhè shì wǒ de yǐzi.', en: 'This is my chair.' },
    { hanzi: '猫在椅子上。', pinyin: 'Māo zài yǐzi shàng.', en: 'The cat is on the chair.' },
    { hanzi: '请坐这个椅子。', pinyin: 'Qǐng zuò zhège yǐzi.', en: 'Please sit in this chair.' }
  ],
  '一点儿': [
    { hanzi: '我会说一点儿汉语。', pinyin: 'Wǒ huì shuō yìdiǎnr Hànyǔ.', en: 'I can speak a little Chinese.' },
    { hanzi: '我想喝一点儿水。', pinyin: 'Wǒ xiǎng hē yìdiǎnr shuǐ.', en: 'I want to drink a little water.' },
    { hanzi: '请说慢一点儿。', pinyin: 'Qǐng shuō màn yìdiǎnr.', en: 'Please speak a little slower.' }
  ],
  '有': [
    { hanzi: '我有一个朋友。', pinyin: 'Wǒ yǒu yí gè péngyou.', en: 'I have a friend.' },
    { hanzi: '桌子上有书。', pinyin: 'Zhuōzi shàng yǒu shū.', en: 'There are books on the table.' },
    { hanzi: '你有钱吗？', pinyin: 'Nǐ yǒu qián ma?', en: 'Do you have money?' }
  ],
  '月': [
    { hanzi: '现在是几月？', pinyin: 'Xiànzài shì jǐ yuè?', en: 'What month is it now?' },
    { hanzi: '我八月去中国。', pinyin: 'Wǒ bā yuè qù Zhōngguó.', en: 'I go to China in August.' },
    { hanzi: '一年有十二个月。', pinyin: 'Yì nián yǒu shí\'èr gè yuè.', en: 'A year has twelve months.' }
  ],
  '再见': [
    { hanzi: '老师，再见！', pinyin: 'Lǎoshī, zàijiàn!', en: 'Goodbye, teacher!' },
    { hanzi: '明天见，再见！', pinyin: 'Míngtiān jiàn, zàijiàn!', en: 'See you tomorrow, bye!' },
    { hanzi: '再见，朋友。', pinyin: 'Zàijiàn, péngyou.', en: 'Goodbye, friend.' }
  ],
  '在': [
    { hanzi: '我在家。', pinyin: 'Wǒ zài jiā.', en: 'I am at home.' },
    { hanzi: '书在桌子上。', pinyin: 'Shū zài zhuōzi shàng.', en: 'The book is on the table.' },
    { hanzi: '他在学校学习。', pinyin: 'Tā zài xuéxiào xuéxí.', en: 'He studies at school.' }
  ],
  '怎么': [
    { hanzi: '这个字怎么写？', pinyin: 'Zhège zì zěnme xiě?', en: 'How do you write this character?' },
    { hanzi: '这个字怎么读？', pinyin: 'Zhège zì zěnme dú?', en: 'How do you read this character?' },
    { hanzi: '去火车站怎么走？', pinyin: 'Qù huǒchēzhàn zěnme zǒu?', en: 'How do I get to the train station?' }
  ],
  '怎么样': [
    { hanzi: '今天天气怎么样？', pinyin: 'Jīntiān tiānqì zěnmeyàng?', en: "How's the weather today?" },
    { hanzi: '这个电影怎么样？', pinyin: 'Zhège diànyǐng zěnmeyàng?', en: "How's this movie?" },
    { hanzi: '你最近怎么样？', pinyin: 'Nǐ zuìjìn zěnmeyàng?', en: 'How have you been lately?' }
  ],
  '这': [
    { hanzi: '这是我的家。', pinyin: 'Zhè shì wǒ de jiā.', en: 'This is my home.' },
    { hanzi: '这本书很好。', pinyin: 'Zhè běn shū hěn hǎo.', en: 'This book is good.' },
    { hanzi: '这是什么？', pinyin: 'Zhè shì shénme?', en: 'What is this?' }
  ],
  '中国': [
    { hanzi: '我想去中国。', pinyin: 'Wǒ xiǎng qù Zhōngguó.', en: 'I want to go to China.' },
    { hanzi: '我是中国人。', pinyin: 'Wǒ shì Zhōngguó rén.', en: 'I am Chinese.' },
    { hanzi: '中国很大。', pinyin: 'Zhōngguó hěn dà.', en: 'China is big.' }
  ],
  '中午': [
    { hanzi: '中午我们吃饭。', pinyin: 'Zhōngwǔ wǒmen chī fàn.', en: 'We eat at noon.' },
    { hanzi: '中午十二点。', pinyin: 'Zhōngwǔ shí\'èr diǎn.', en: "It's twelve noon." },
    { hanzi: '中午我想睡觉。', pinyin: 'Zhōngwǔ wǒ xiǎng shuìjiào.', en: 'I want to nap at noon.' }
  ],
  '住': [
    { hanzi: '我住在北京。', pinyin: 'Wǒ zhù zài Běijīng.', en: 'I live in Beijing.' },
    { hanzi: '你住在哪儿？', pinyin: 'Nǐ zhù zài nǎr?', en: 'Where do you live?' },
    { hanzi: '他住在学校后面。', pinyin: 'Tā zhù zài xuéxiào hòumiàn.', en: 'He lives behind the school.' }
  ],
  '桌子': [
    { hanzi: '桌子上有书。', pinyin: 'Zhuōzi shàng yǒu shū.', en: 'There are books on the table.' },
    { hanzi: '这个桌子很大。', pinyin: 'Zhège zhuōzi hěn dà.', en: 'This table is big.' },
    { hanzi: '杯子在桌子上。', pinyin: 'Bēizi zài zhuōzi shàng.', en: 'The cup is on the table.' }
  ],
  '字': [
    { hanzi: '这个字怎么读？', pinyin: 'Zhège zì zěnme dú?', en: 'How do you read this character?' },
    { hanzi: '我会写这个字。', pinyin: 'Wǒ huì xiě zhège zì.', en: 'I can write this character.' },
    { hanzi: '这个字很难。', pinyin: 'Zhège zì hěn nán.', en: 'This character is hard.' }
  ],
  '昨天': [
    { hanzi: '昨天我看了电影。', pinyin: 'Zuótiān wǒ kàn le diànyǐng.', en: 'Yesterday I watched a movie.' },
    { hanzi: '昨天很冷。', pinyin: 'Zuótiān hěn lěng.', en: 'Yesterday was cold.' },
    { hanzi: '昨天是星期一。', pinyin: 'Zuótiān shì xīngqīyī.', en: 'Yesterday was Monday.' }
  ],
  '坐': [
    { hanzi: '请坐。', pinyin: 'Qǐng zuò.', en: 'Please sit.' },
    { hanzi: '我坐飞机去。', pinyin: 'Wǒ zuò fēijī qù.', en: 'I go by plane.' },
    { hanzi: '他坐在椅子上。', pinyin: 'Tā zuò zài yǐzi shàng.', en: 'He sits on the chair.' }
  ],
  '做': [
    { hanzi: '你做什么工作？', pinyin: 'Nǐ zuò shénme gōngzuò?', en: 'What work do you do?' },
    { hanzi: '妈妈在做菜。', pinyin: 'Māma zài zuò cài.', en: 'Mom is cooking.' },
    { hanzi: '我想做医生。', pinyin: 'Wǒ xiǎng zuò yīshēng.', en: 'I want to be a doctor.' }
  ]
}
