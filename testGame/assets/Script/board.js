//棋盘控制
cc.Class({
    extends: cc.Component,

    properties: {

        chessWhite: {
            default: null,
            type: cc.Prefab,
        },

        chessBlack: {
            default: null,
            type: cc.Prefab,
        },

        victoryDisplay: {
            default: null,
            type: cc.Label,
        },

        guide: {
            default: null,
            type: cc.Label,
        },
    },


    /**
     * 预加载，用于初始化棋盘
     */
    onLoad: function () {

        //落子数统计
        this.sum = 0;

        //胜利展示字符
        this.winString = "某棋获胜！"

        //胜负判定标志，0平局，1黑胜，2白胜
        this.win = 0;

        //交替落子,-1为黑，1为白
        this.state = -1;

        //启用触屏监听
        this.node.on(cc.Node.EventType.TOUCH_START, this.MoveInChess, this);

        //判定棋盘初始化
        this.maze = new Array();
        for (let i = 0; i < 20; i++) {
            this.maze[i] = new Array();
            for (let j = 0; j < 20; j++) {
                this.maze[i][j] = 0;
            }
        }
    },


    /**
     * 落子
     * @param {touch事件传入} event 
     */
    MoveInChess: function (event) {

        //采用预制资源创建一个新棋子
        var chess;
        if (-1 == this.state) {
            chess = cc.instantiate(this.chessBlack);
        } else {
            chess = cc.instantiate(this.chessWhite);
        }

        //获取点击坐标
        let pos = event.getLocation();

        cc.log(pos);

        //世界坐标转换
        chess.x = pos.x - 350;
        chess.y = pos.y - 350;

        //负坐标处理标记
        let flag = 1;

        //对x坐标取整
        if (chess.x < 0) {
            chess.x = -chess.x;
            flag = -1;
        } else {
            flag = 1;
        }
        //判断舍入
        var remainX = chess.x % 50;
        chess.x = parseInt(chess.x / 50) * 50;
        if (remainX - 25 >= 0) {
            chess.x += 50;
        }
        chess.x *= flag;

        //对y坐标取整
        if (chess.y < 0) {
            chess.y = -chess.y;
            flag = -1;
        } else {
            flag = 1;
        }
        //判断舍入
        var remainY = chess.y % 50;
        chess.y = parseInt(chess.y / 50) * 50;
        if (remainY - 25 >= 0) {
            chess.y += 50;
        }
        chess.y *= flag;

        //转换后置入判定棋盘
        var tx = (chess.x / 50) + 8;
        var ty = (chess.y / 50) + 8;

        if (this.maze[tx][ty] != 0) {
            return;
        }

        this.sum++;
        this.maze[tx][ty] = this.state;

        cc.log("x:" + chess.x + "  y:" + chess.y);

        //将棋子加入棋盘
        this.node.addChild(chess);

        //变色
        this.state *= -1;
        if (this.state == -1) {
            this.guide.string = "落子方:黑";
        } else {
            this.guide.string = "落子方:白";
        }

        //落子后进行判定
        this.judge(tx, ty);
    },


    /**
     * 胜负判定
     * 
     */
    judge: function (tx, ty) {

        //胜负已分时，终止函数执行
        if (0 != this.win) {
            return;
        }

        //棋子判定累加计数器(为5或者-5时出现胜负)
        var rowSum = 0, colSum = 0, biasSumA = 0, biasSumB = 0;

        //判定长度限制
        var length = 16;

        //扫描终止标志
        var stop = 0;

        //棋盘扫描
        for (let i = 1; i < length; i++) {
            for (let j = 1; j < length; j++) {
                //纵轴判定
                if (this.maze[i][j - 1] == this.maze[i][j]) {
                    colSum += this.maze[i][j];
                } else {
                    colSum = 0;
                    colSum += this.maze[i][j];
                }

                if (this.maze[j - 1][i] == this.maze[j][i]) {
                    rowSum += this.maze[j][i];
                } else {
                    rowSum = 0;
                    rowSum += this.maze[j][i];
                }

                if ((tx - ty) == (i - j)) {
                    if (this.maze[i - 1][j - 1] == this.maze[i][j]) {
                        biasSumA += this.maze[i][j];
                    } else {
                        biasSumA = 0;
                        biasSumA += this.maze[i][j];
                    }
                }

                if ((tx + ty) == (i + j)) {
                    if (this.maze[i - 1][j + 1] == this.maze[i][j]) {
                        biasSumB += this.maze[i][j];
                    } else {
                        biasSumB = 0;
                        biasSumB += this.maze[i][j];
                    }
                }

                if (colSum >= 5 || colSum <= -5 ||
                    rowSum >= 5 || rowSum <= -5 ||
                    biasSumA >= 5 || biasSumA <= -5 ||
                    biasSumB >= 5 || biasSumB <= -5) {
                    stop = 1;
                    break;
                }
            }
            if (1 == stop) {
                break;
            }
        }

        cc.log("rowSum:" + rowSum);
        cc.log("colSum:" + colSum);
        cc.log("biasSum:" + biasSumA + "," + biasSumB);

        //结果判定
        if (rowSum >= 5 || colSum >= 5 ||
            biasSumA >= 5 || biasSumB >= 5) {
            //白胜
            this.win = 1;
            cc.log("白胜！");
            this.winString = "白棋获胜！";
        } else if (rowSum <= -5 || colSum <= -5
            || biasSumA <= -5 || biasSumB <= -5) {
            //黑胜
            this.win = 2;
            cc.log("黑胜！");
            this.winString = "黑棋获胜！";
        } else {
            //平局或未结束
            this.win = 0;
            cc.log("平局或未结束！");
        }

        cc.log(this.sum);
    },


    /**
     * 判定传入坐标是否合法(坐标转换后合法范围为1~15)
     * @param {X轴坐标} x 
     * @param {Y轴坐标} y 
     */
    positionConfirm: function (x, y) {
        if (x < 1 || y < 1 || x > 15 || y > 15) {
            return false;
        } else {
            return true;
        }
    },


    /**
     * 刷新
     * @param {每帧间隔时间} dt 
     */
    update: function (dt) {
        if (this.win != 0) {
            this.victoryDisplay.string = this.winString;
            this.victoryDisplay.enabled = true;
            this.onDestroy();
        }
        if (this.sum >= 255 && this.win == 0) {
            this.victoryDisplay.string = "平局！";
            this.victoryDisplay.enabled = true;
            this.onDestroy();
        }
    },


    
    /**
     * 销毁
     */
    onDestroy: function () {
        //关闭鼠标监听
        this.node.off(cc.Node.EventType.TOUCH_START, this.MoveInChess, this);
    },
});
