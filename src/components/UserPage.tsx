import React, { useState } from 'react';
import { User, UserCircle, Mail, LogOut, Award, TrendingUp, Calendar, Clock, Target, FileText, BarChart3, Trophy, Star, CheckCircle, Edit3, Save, X } from 'lucide-react';
import { useAnalysisStore } from '../store/analysisStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedAt?: Date;
    progress?: number;
    target?: number;
}

interface Activity {
    id: string;
    type: 'create' | 'update' | 'complete' | 'export';
    title: string;
    description: string;
    timestamp: Date;
    icon: string;
}

export const UserPage: React.FC = () => {
    const { data } = useAnalysisStore();
    const [isEditing, setIsEditing] = useState(false);
    const [userInfo, setUserInfo] = useState({
        name: '匿名用户',
        email: 'guest@achanalysis.com',
        joinDate: new Date('2024-01-01'),
        bio: '热爱分析思考的用户'
    });

    // 模拟使用统计
    const stats = {
        projectsCreated: 1,
        analysesCompleted: 0,
        hypothesesTotal: data.hypotheses.length,
        evidenceTotal: data.evidence.length,
        daysActive: Math.floor((new Date().getTime() - userInfo.joinDate.getTime()) / (1000 * 60 * 60 * 24)),
        totalTime: '12小时30分钟'
    };

    // 成就系统
    const achievements: Achievement[] = [
        {
            id: 'first-project',
            title: '初来乍到',
            description: '创建第一个分析项目',
            icon: '🎯',
            earned: stats.projectsCreated >= 1,
            earnedAt: stats.projectsCreated >= 1 ? new Date() : undefined
        },
        {
            id: 'hypothesis-master',
            title: '假设大师',
            description: '在单个项目中创建5个以上假设',
            icon: '💡',
            earned: stats.hypothesesTotal >= 5,
            progress: stats.hypothesesTotal,
            target: 5
        },
        {
            id: 'evidence-collector',
            title: '证据收集者',
            description: '收集10个以上证据',
            icon: '📄',
            earned: stats.evidenceTotal >= 10,
            progress: stats.evidenceTotal,
            target: 10
        },
        {
            id: 'matrix-expert',
            title: '矩阵专家',
            description: '完成完整的分析矩阵',
            icon: '📊',
            earned: Object.keys(data.matrix).length >= data.hypotheses.length * data.evidence.length && data.hypotheses.length > 0 && data.evidence.length > 0,
            progress: Object.keys(data.matrix).length,
            target: data.hypotheses.length * data.evidence.length || 1
        },
        {
            id: 'persistent-user',
            title: '坚持不懈',
            description: '连续使用7天',
            icon: '🔥',
            earned: stats.daysActive >= 7,
            progress: stats.daysActive,
            target: 7
        },
        {
            id: 'analysis-complete',
            title: '分析达人',
            description: '完成第一个完整分析',
            icon: '🏆',
            earned: stats.analysesCompleted >= 1,
            progress: stats.analysesCompleted,
            target: 1
        }
    ];

    // 近期活动
    const recentActivities: Activity[] = [
        {
            id: '1',
            type: 'create',
            title: '创建新项目',
            description: '创建了"当前分析项目"',
            timestamp: new Date(),
            icon: '🎯'
        },
        {
            id: '2',
            type: 'update',
            title: '添加假设',
            description: `添加了 ${data.hypotheses.length} 个假设`,
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            icon: '💡'
        },
        {
            id: '3',
            type: 'update',
            title: '收集证据',
            description: `添加了 ${data.evidence.length} 个证据`,
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            icon: '📄'
        }
    ];

    const handleSaveProfile = () => {
        setIsEditing(false);
        // 这里应该保存到存储
    };

    const earnedAchievements = achievements.filter(a => a.earned);
    const nextAchievements = achievements.filter(a => !a.earned).slice(0, 3);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'create': return <Target className="w-4 h-4 text-blue-600" />;
            case 'update': return <Edit3 className="w-4 h-4 text-green-600" />;
            case 'complete': return <CheckCircle className="w-4 h-4 text-purple-600" />;
            case 'export': return <FileText className="w-4 h-4 text-orange-600" />;
            default: return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
                    <p className="text-gray-600 mt-1">管理您的个人信息和使用记录</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧主要内容 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 用户资料 */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl flex items-center space-x-2">
                                    <UserCircle className="h-6 w-6 text-blue-600" />
                                    <span>个人资料</span>
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                >
                                    {isEditing ? (
                                        <><Save className="w-4 h-4 mr-2" />保存</>
                                    ) : (
                                        <><Edit3 className="w-4 h-4 mr-2" />编辑</>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start space-x-6">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                                    <UserCircle className="h-16 w-16 text-blue-600" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-1 block">姓名</Label>
                                                <Input
                                                    value={userInfo.name}
                                                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-1 block">邮箱</Label>
                                                <Input
                                                    value={userInfo.email}
                                                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className="text-sm font-medium text-gray-700 mb-1 block">个人简介</Label>
                                                <textarea
                                                    value={userInfo.bio}
                                                    onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                                                    className="w-full p-2 border border-gray-300 rounded-md resize-none h-20"
                                                    placeholder="介绍一下您自己..."
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">{userInfo.name}</h3>
                                                <p className="text-gray-600 flex items-center space-x-1">
                                                    <Mail className="w-4 h-4" />
                                                    <span>{userInfo.email}</span>
                                                </p>
                                            </div>
                                            <p className="text-gray-700">{userInfo.bio}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>加入时间: {userInfo.joinDate.toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>使用时长: {stats.totalTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 使用统计 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center space-x-2">
                                <BarChart3 className="h-6 w-6 text-green-600" />
                                <span>使用统计</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Target className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.projectsCreated}</div>
                                    <div className="text-sm text-gray-600">创建项目</div>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.analysesCompleted}</div>
                                    <div className="text-sm text-gray-600">完成分析</div>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <FileText className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.hypothesesTotal + stats.evidenceTotal}</div>
                                    <div className="text-sm text-gray-600">总条目数</div>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <TrendingUp className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{stats.daysActive}</div>
                                    <div className="text-sm text-gray-600">活跃天数</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 成就系统 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center space-x-2">
                                <Trophy className="h-6 w-6 text-yellow-600" />
                                <span>成就徽章</span>
                                <Badge variant="outline">{earnedAchievements.length}/{achievements.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* 已获得成就 */}
                                {earnedAchievements.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">已获得成就</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {earnedAchievements.map((achievement) => (
                                                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="text-2xl">{achievement.icon}</div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h5 className="font-medium text-gray-900">{achievement.title}</h5>
                                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <p className="text-sm text-gray-600">{achievement.description}</p>
                                                        {achievement.earnedAt && (
                                                            <p className="text-xs text-green-600 mt-1">
                                                                获得时间: {achievement.earnedAt.toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 待获得成就 */}
                                {nextAchievements.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">待获得成就</h4>
                                        <div className="space-y-3">
                                            {nextAchievements.map((achievement) => (
                                                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                    <div className="text-2xl opacity-50">{achievement.icon}</div>
                                                    <div className="flex-1">
                                                        <h5 className="font-medium text-gray-900">{achievement.title}</h5>
                                                        <p className="text-sm text-gray-600">{achievement.description}</p>
                                                        {achievement.progress !== undefined && achievement.target && (
                                                            <div className="mt-2">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-gray-600">进度</span>
                                                                    <span className="font-medium">{achievement.progress}/{achievement.target}</span>
                                                                </div>
                                                                <Progress
                                                                    value={(achievement.progress / achievement.target) * 100}
                                                                    className="h-2 mt-1"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 右侧信息面板 */}
                <div className="space-y-6">
                    {/* 等级信息 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                                <Star className="h-5 w-5 text-yellow-600" />
                                <span>等级信息</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl font-bold text-white">1</span>
                                </div>
                                <h3 className="font-semibold text-gray-900">分析新手</h3>
                                <p className="text-sm text-gray-600">初入ACH分析世界</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-600">经验值</span>
                                    <span className="font-medium">150/500</span>
                                </div>
                                <Progress value={30} className="h-2" />
                                <p className="text-xs text-gray-500 mt-1">距离下一级还需350经验</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 近期活动 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-purple-600" />
                                <span>近期活动</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                                        <div className="p-2 bg-gray-100 rounded-full">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                                            <p className="text-xs text-gray-600">{activity.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {activity.timestamp.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 快速统计 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">本月统计</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">新建项目</span>
                                <Badge variant="outline">1</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">添加假设</span>
                                <Badge variant="outline">{stats.hypothesesTotal}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">收集证据</span>
                                <Badge variant="outline">{stats.evidenceTotal}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">完成分析</span>
                                <Badge variant="outline">{stats.analysesCompleted}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 账户操作 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">账户操作</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <Mail className="h-4 w-4 mr-2" />
                                反馈建议
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start">
                                <FileText className="h-4 w-4 mr-2" />
                                导出数据
                            </Button>
                            <Separator />
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                退出登录
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 帮助提示 */}
            <Alert className="border-blue-200 bg-blue-50">
                <UserCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>个人中心说明：</strong>
                    <p className="mt-2 text-sm">
                        这里展示了您的使用统计、获得的成就和近期活动。
                        通过完成更多分析任务可以获得经验值和解锁新成就。
                        所有数据均保存在本地，隐私安全有保障。
                    </p>
                </AlertDescription>
            </Alert>
        </div>
    );
}; 