from flask import Flask, render_template, request, jsonify
import os
import subprocess
import psutil
from datetime import datetime

app = Flask(__name__)

def get_system_info():
    """获取系统信息"""
    disk = psutil.disk_usage('/')
    memory = psutil.virtual_memory()
    
    return {
        'cpu_percent': psutil.cpu_percent(interval=1),
        'memory_percent': memory.percent,
        'disk_percent': disk.percent,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

def get_service_status():
    """获取服务状态"""
    services = {
        'ssh': False,
        'web': False,
        'pm2': False
    }
    
    # 检查SSH服务
    try:
        result = subprocess.run(['pgrep', 'sshd'], capture_output=True, text=True)
        services['ssh'] = result.returncode == 0
    except:
        pass
    
    # 检查Web服务
    try:
        result = subprocess.run(['pgrep', '-f', 'http.server'], capture_output=True, text=True)
        services['web'] = result.returncode == 0
    except:
        pass
    
    # 检查PM2
    try:
        result = subprocess.run(['pgrep', 'pm2'], capture_output=True, text=True)
        services['pm2'] = result.returncode == 0
    except:
        pass
    
    return services

@app.route('/')
def index():
    """主页"""
    system_info = get_system_info()
    services = get_service_status()
    
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <title>手机服务器控制面板</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
            .card {{ background: white; padding: 20px; margin: 10px 0; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
            .status-on {{ color: green; font-weight: bold; }}
            .status-off {{ color: red; font-weight: bold; }}
            .btn {{ padding: 10px 20px; margin: 5px; border: none; border-radius: 5px; cursor: pointer; }}
            .btn-start {{ background: #4CAF50; color: white; }}
            .btn-stop {{ background: #f44336; color: white; }}
            .progress {{ background: #ddd; border-radius: 5px; margin: 5px 0; }}
            .progress-bar {{ background: #4CAF50; height: 20px; border-radius: 5px; text-align: center; color: white; }}
        </style>
    </head>
    <body>
        <h1>📱 手机服务器控制面板</h1>
        
        <div class="card">
            <h2>📊 系统状态</h2>
            <p>CPU使用: {system_info['cpu_percent']}%</p>
            <div class="progress">
                <div class="progress-bar" style="width: {system_info['cpu_percent']}%">{system_info['cpu_percent']}%</div>
            </div>
            
            <p>内存使用: {system_info['memory_percent']}%</p>
            <div class="progress">
                <div class="progress-bar" style="width: {system_info['memory_percent']}%">{system_info['memory_percent']}%</div>
            </div>
            
            <p>存储空间: {system_info['disk_percent']}%</p>
            <div class="progress">
                <div class="progress-bar" style="width: {system_info['disk_percent']}%">{system_info['disk_percent']}%</div>
            </div>
            
            <p>更新时间: {system_info['timestamp']}</p>
        </div>

        <div class="card">
            <h2>🔧 服务管理</h2>
            <p>SSH服务: <span class="{'status-on' if services['ssh'] else 'status-off'}">{'✅ 运行中' if services['ssh'] else '❌ 已停止'}</span></p>
            <button class="btn btn-start" onclick="controlService('start_ssh')">启动SSH</button>
            <button class="btn btn-stop" onclick="controlService('stop_ssh')">停止SSH</button>

            <p>Web服务: <span class="{'status-on' if services['web'] else 'status-off'}">{'✅ 运行中' if services['web'] else '❌ 已停止'}</span></p>
            <button class="btn btn-start" onclick="controlService('start_web')">启动Web</button>
            <button class="btn btn-stop" onclick="controlService('stop_web')">停止Web</button>

            <p>PM2守护: <span class="{'status-on' if services['pm2'] else 'status-off'}">{'✅ 运行中' if services['pm2'] else '❌ 已停止'}</span></p>
            <button class="btn btn-start" onclick="controlService('start_pm2')">启动PM2</button>
            <button class="btn btn-stop" onclick="controlService('stop_pm2')">停止PM2</button>
        </div>

        <div class="card">
            <h2>💡 快速操作</h2>
            <button class="btn btn-start" onclick="controlService('wake_lock')">激活防息屏</button>
            <button class="btn btn-stop" onclick="controlService('wake_unlock')">关闭防息屏</button>
            <button class="btn" onclick="controlService('restart_all')">重启所有服务</button>
        </div>

        <script>
        function controlService(action) {{
            fetch('/api/' + action)
                .then(response => response.json())
                .then(data => {{
                    alert(data.message);
                    location.reload();
                }});
        }}

        // 每10秒自动刷新状态
        setInterval(() => {{
            location.reload();
        }}, 10000);
        </script>
    </body>
    </html>
    '''

@app.route('/api/<action>')
def api_control(action):
    """API接口控制服务"""
    try:
        if action == 'start_ssh':
            subprocess.run(['sshd'], check=True)
            return jsonify({'message': 'SSH服务已启动'})
        
        elif action == 'stop_ssh':
            subprocess.run(['pkill', 'sshd'], check=True)
            return jsonify({'message': 'SSH服务已停止'})
        
        elif action == 'start_web':
            subprocess.run(['pkill', '-f', 'http.server'], check=False)
            subprocess.Popen(['python', '-m', 'http.server', '8000'], 
                           cwd=os.path.expanduser('~/storage/shared/termux-projects/my-website'))
            return jsonify({'message': 'Web服务已启动'})
        
        elif action == 'stop_web':
            subprocess.run(['pkill', '-f', 'http.server'], check=True)
            return jsonify({'message': 'Web服务已停止'})
        
        elif action == 'start_pm2':
            subprocess.run(['pm2', 'resurrect'], check=True)
            return jsonify({'message': 'PM2服务已启动'})
        
        elif action == 'stop_pm2':
            subprocess.run(['pm2', 'kill'], check=True)
            return jsonify({'message': 'PM2服务已停止'})
        
        elif action == 'wake_lock':
            subprocess.run(['termux-wake-lock'], check=True)
            return jsonify({'message': '防息屏已激活'})
        
        elif action == 'wake_unlock':
            subprocess.run(['termux-wake-unlock'], check=True)
            return jsonify({'message': '防息屏已关闭'})
        
        elif action == 'restart_all':
            subprocess.run(['pkill', 'sshd'], check=False)
            subprocess.run(['pkill', '-f', 'http.server'], check=False)
            subprocess.run(['sshd'], check=True)
            subprocess.Popen(['python', '-m', 'http.server', '8000'], 
                           cwd=os.path.expanduser('~/storage/shared/termux-projects/my-website'))
            subprocess.run(['termux-wake-lock'], check=True)
            return jsonify({'message': '所有服务已重启'})
        
        else:
            return jsonify({'message': '未知操作'})
    
    except Exception as e:
        return jsonify({'message': f'操作失败: {str(e)}'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
