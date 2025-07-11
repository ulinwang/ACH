import React, { useState, useEffect } from 'react';
import { useAnalysisStore } from './store/analysisStore';
import { ACHAnalysis } from './components/ACHAnalysis';
import { ProjectManagement } from './components/ProjectManagement';
import { HelpPage } from './components/HelpPage';
import { SettingsPage } from './components/SettingsPage';
import { UserPage } from './components/UserPage';
import { Toaster } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import {
  Brain,
  Home,
  Settings,
  HelpCircle,
  User,
  ChevronRight,
  Save,
  ArrowLeft,
  FolderOpen,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';

type Page = 'projects' | 'analysis' | 'help' | 'settings' | 'user';

function App() {
  const { data, saveAnalysis } = useAnalysisStore();
  const [currentPage, setCurrentPage] = useState<Page>('projects');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // 监听hash变化，支持简单的路由
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/analysis') {
        setCurrentPage('analysis');
      } else if (hash === '#/help') {
        setCurrentPage('help');
      } else if (hash === '#/settings') {
        setCurrentPage('settings');
      } else if (hash === '#/user') {
        setCurrentPage('user');
      } else {
        setCurrentPage('projects');
      }
    };

    // 初始化页面
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToProjects = () => {
    window.location.hash = '#/projects';
    setCurrentPage('projects');
  };

  const navigateToAnalysis = () => {
    window.location.hash = '#/analysis';
    setCurrentPage('analysis');
  };

  const navigateToHelp = () => {
    window.location.hash = '#/help';
    setCurrentPage('help');
  };

  const navigateToSettings = () => {
    window.location.hash = '#/settings';
    setCurrentPage('settings');
  };

  const navigateToUser = () => {
    window.location.hash = '#/user';
    setCurrentPage('user');
  };

  const handleSaveClick = () => {
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = () => {
    try {
      saveAnalysis();
      setShowSaveDialog(false);
      // 显示成功提示
      // 可以添加toast提示
    } catch (error) {
      console.error('保存失败:', error);
      // 可以添加错误提示
    }
  };

  const renderBreadcrumb = () => {
    const pageNames = {
      'projects': '项目管理',
      'analysis': data.title || '新建分析',
      'help': '使用帮助',
      'settings': '系统设置',
      'user': '个人中心'
    };

    if (currentPage === 'projects') {
      return (
        <nav className="flex items-center space-x-1 text-sm text-gray-600">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{pageNames[currentPage]}</span>
        </nav>
      );
    } else if (currentPage === 'analysis') {
      return (
        <nav className="flex items-center space-x-1 text-sm text-gray-600">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={navigateToProjects}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            项目管理
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{pageNames[currentPage]}</span>
        </nav>
      );
    } else {
      return (
        <nav className="flex items-center space-x-1 text-sm text-gray-600">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={navigateToProjects}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            项目管理
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{pageNames[currentPage]}</span>
        </nav>
      );
    }
  };

  const renderPageActions = () => {
    if (currentPage === 'projects') {
      return null;
    } else {
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={navigateToProjects}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回项目
          </Button>
          <Button size="sm" onClick={handleSaveClick}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 保存确认对话框 */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>确认保存</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-gray-900">
                  您确定要保存当前的分析进度吗？
                </p>
                <p className="text-xs text-gray-600">
                  保存后将覆盖之前的分析数据，此操作不可撤销。
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveConfirm} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                确认保存
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">ACH 分析工具</h1>
                <p className="text-sm text-gray-500">竞争性假设分析平台</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-8" />
            {renderBreadcrumb()}
          </div>

          <div className="flex items-center space-x-2">
            {renderPageActions()}
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" onClick={navigateToHelp}>
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={navigateToSettings}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={navigateToUser}>
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="flex-1">
        {currentPage === 'projects' && <ProjectManagement />}
        {currentPage === 'analysis' && <ACHAnalysis />}
        {currentPage === 'help' && <HelpPage />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'user' && <UserPage />}
      </main>

      {/* Toast 通知 */}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
