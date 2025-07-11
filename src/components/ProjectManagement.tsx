import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalysisStore } from '../store/analysisStore';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import {
    Plus,
    Edit3,
    Trash2,
    Save,
    X,
    FileText,
    Calendar,
    Users,
    Target,
    TrendingUp,
    Brain,
    Search,
    Filter,
    Download,
    Upload,
    FolderPlus,
    Lightbulb,
    BarChart3
} from 'lucide-react';

interface ProjectCardProps {
    project: {
        id: string;
        title: string;
        topic: string;
        createdAt: Date;
        updatedAt: Date;
        hypothesesCount: number;
        evidenceCount: number;
        progress: number;
    };
    onEdit: () => void;
    onDelete: () => void;
    onOpen: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onOpen }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="group"
        >
            <Card className="h-full hover:shadow-md transition-all duration-200 border-gray-200 hover:border-blue-300">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-medium text-gray-900 line-clamp-1">
                                {project.title || '未命名项目'}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {project.topic || '暂无分析议题'}
                            </p>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" onClick={onEdit} className="h-6 w-6 p-0">
                                <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={onDelete} className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-3">
                        {/* 统计信息 */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center space-x-1">
                                <Target className="w-3 h-3 text-blue-500" />
                                <span className="text-gray-600">假设: {project.hypothesesCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <FileText className="w-3 h-3 text-green-500" />
                                <span className="text-gray-600">证据: {project.evidenceCount}</span>
                            </div>
                        </div>

                        {/* 进度条 */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">完成度</span>
                                <span className="text-xs font-medium text-blue-600">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* 时间信息 */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>创建: {project.createdAt.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <span>更新: {project.updatedAt.toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* 操作按钮 */}
                        <Separator />
                        <Button onClick={onOpen} className="w-full" size="sm">
                            打开分析
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export const ProjectManagement: React.FC = () => {
    const { data, updateTitle, updateTopic, resetAnalysis } = useAnalysisStore();
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newProject, setNewProject] = useState({ title: '', topic: '' });
    const [editProject, setEditProject] = useState({ title: '', topic: '' });

    // 模拟项目列表（在实际应用中，这应该来自store或API）
    const [projects, setProjects] = useState([
        {
            id: 'current',
            title: data.title || '当前分析项目',
            topic: data.topic || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            hypothesesCount: data.hypotheses.length,
            evidenceCount: data.evidence.length,
            progress: calculateProgress()
        }
    ]);

    function calculateProgress() {
        let progress = 0;

        // 步骤1：假设管理 (15%)
        if (data.hypotheses.length > 0) {
            progress += 15;
        }

        // 步骤2：证据收集 (15%)
        if (data.evidence.length > 0) {
            progress += 15;
        }

        // 步骤3：分析矩阵 (20%)
        const totalCells = data.hypotheses.length * data.evidence.length;
        const filledCells = Object.keys(data.matrix).length;
        const matrixProgress = totalCells > 0 ? (filledCells / totalCells) : 0;
        progress += Math.round(matrixProgress * 20);

        // 步骤4：矩阵精简 (10%)
        if (matrixProgress > 0.3) { // 如果矩阵有基本评分就算完成精简
            progress += 10;
        }

        // 步骤5：分析结论 (15%)
        if (data.conclusions.length > 0) {
            progress += 15;
        }

        // 步骤6：敏感性分析 (10%)
        if (data.sensitivity && data.sensitivity.length > 0) {
            progress += 10;
        }

        // 步骤7：生成报告 (10%)
        if (data.report && (data.report.executiveSummary || data.report.methodology || data.report.findings)) {
            progress += 10;
        }

        // 步骤8：设置里程碑 (5%)
        if (data.milestones.length > 0) {
            progress += 5;
        }

        return Math.min(progress, 100);
    }

    const handleCreateProject = () => {
        if (newProject.title.trim() && newProject.topic.trim()) {
            const project = {
                id: Date.now().toString(),
                title: newProject.title,
                topic: newProject.topic,
                createdAt: new Date(),
                updatedAt: new Date(),
                hypothesesCount: 0,
                evidenceCount: 0,
                progress: 0
            };
            setProjects(prev => [project, ...prev]);
            setNewProject({ title: '', topic: '' });
            setIsCreating(false);
        }
    };

    const handleEditProject = () => {
        if (editProject.title.trim() && editProject.topic.trim()) {
            updateTitle(editProject.title);
            updateTopic(editProject.topic);
            setProjects(prev => prev.map(p =>
                p.id === 'current'
                    ? { ...p, title: editProject.title, topic: editProject.topic, updatedAt: new Date() }
                    : p
            ));
            setIsEditing(false);
        }
    };

    const handleDeleteProject = (id: string) => {
        if (confirm('确定要删除这个项目吗？此操作不可恢复。')) {
            if (id === 'current') {
                resetAnalysis();
            }
            setProjects(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleOpenProject = (id: string) => {
        // 在实际应用中，这里应该加载对应的项目数据
        // 目前只有一个当前项目，所以直接进入分析界面
        window.location.hash = '#/analysis';
    };

    const startEditCurrentProject = () => {
        setEditProject({ title: data.title, topic: data.topic });
        setIsEditing(true);
    };

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.progress > 0 && p.progress < 100).length,
        completedProjects: projects.filter(p => p.progress === 100).length,
        totalHypotheses: projects.reduce((sum, p) => sum + p.hypothesesCount, 0),
        totalEvidence: projects.reduce((sum, p) => sum + p.evidenceCount, 0)
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* 页面标题 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">项目管理</h1>
                    <p className="text-gray-600 mt-1">管理您的ACH分析项目</p>
                </div>
                <div className="flex space-x-3">
                    <Dialog open={isCreating} onOpenChange={setIsCreating}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                新建项目
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>新建分析项目</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="new-title" className="text-sm font-medium">项目标题 *</Label>
                                    <Input
                                        id="new-title"
                                        value={newProject.title}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="输入项目标题..."
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="new-topic" className="text-sm font-medium">分析议题 *</Label>
                                    <textarea
                                        id="new-topic"
                                        value={newProject.topic}
                                        onChange={(e) => setNewProject(prev => ({ ...prev, topic: e.target.value }))}
                                        placeholder="请输入需要分析的核心议题..."
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={handleCreateProject}
                                        disabled={!newProject.title.trim() || !newProject.topic.trim()}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        创建项目
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreating(false);
                                            setNewProject({ title: '', topic: '' });
                                        }}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        取消
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">总项目数</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.totalProjects}</p>
                            </div>
                            <FolderPlus className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">进行中</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.activeProjects}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">已完成</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completedProjects}</p>
                            </div>
                            <Target className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">总假设</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.totalHypotheses}</p>
                            </div>
                            <Lightbulb className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">总证据</p>
                                <p className="text-2xl font-bold text-teal-600">{stats.totalEvidence}</p>
                            </div>
                            <FileText className="h-8 w-8 text-teal-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 搜索和筛选 */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="搜索项目名称或议题..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    筛选
                </Button>
            </div>

            {/* 编辑项目弹窗 */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>编辑项目信息</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-title" className="text-sm font-medium">项目标题 *</Label>
                            <Input
                                id="edit-title"
                                value={editProject.title}
                                onChange={(e) => setEditProject(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="输入项目标题..."
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-topic" className="text-sm font-medium">分析议题 *</Label>
                            <textarea
                                id="edit-topic"
                                value={editProject.topic}
                                onChange={(e) => setEditProject(prev => ({ ...prev, topic: e.target.value }))}
                                placeholder="请输入需要分析的核心议题..."
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                onClick={handleEditProject}
                                disabled={!editProject.title.trim() || !editProject.topic.trim()}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                保存修改
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditProject({ title: '', topic: '' });
                                }}
                            >
                                <X className="w-4 h-4 mr-2" />
                                取消
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 项目列表 */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">我的项目</h2>
                    <div className="text-sm text-gray-500">
                        共 {filteredProjects.length} 个项目
                    </div>
                </div>

                {filteredProjects.length === 0 ? (
                    <Card className="border-dashed border-gray-300">
                        <CardContent className="p-12">
                            <div className="text-center text-gray-500">
                                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-xl mb-2">还没有分析项目</p>
                                <p className="text-sm mb-4">创建您的第一个ACH分析项目开始使用</p>
                                <Dialog open={isCreating} onOpenChange={setIsCreating}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            新建项目
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>新建分析项目</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="new-title" className="text-sm font-medium">项目标题 *</Label>
                                                <Input
                                                    id="new-title"
                                                    value={newProject.title}
                                                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                                                    placeholder="输入项目标题..."
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="new-topic" className="text-sm font-medium">分析议题 *</Label>
                                                <textarea
                                                    id="new-topic"
                                                    value={newProject.topic}
                                                    onChange={(e) => setNewProject(prev => ({ ...prev, topic: e.target.value }))}
                                                    placeholder="请输入需要分析的核心议题..."
                                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={handleCreateProject}
                                                    disabled={!newProject.title.trim() || !newProject.topic.trim()}
                                                >
                                                    <Save className="w-4 h-4 mr-2" />
                                                    创建项目
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsCreating(false);
                                                        setNewProject({ title: '', topic: '' });
                                                    }}
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    取消
                                                </Button>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onEdit={() => project.id === 'current' ? startEditCurrentProject() : {}}
                                    onDelete={() => handleDeleteProject(project.id)}
                                    onOpen={() => handleOpenProject(project.id)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* 帮助提示 */}
            <Alert className="border-blue-200 bg-blue-50">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    <strong>使用提示：</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                        <li>• 点击"新建项目"创建新的ACH分析项目</li>
                        <li>• 使用搜索功能快速找到特定项目</li>
                        <li>• 项目卡片显示完成度和基本统计信息</li>
                        <li>• 可以导入/导出项目进行备份和共享</li>
                    </ul>
                </AlertDescription>
            </Alert>
        </div>
    );
}; 