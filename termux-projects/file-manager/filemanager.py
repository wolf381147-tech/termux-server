from flask import Flask, render_template, request, jsonify, send_file
import os
import humanize
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.expanduser('~/storage/shared/')

def get_file_info(path):
    """获取文件信息"""
    if os.path.isdir(path):
        return {'type': 'directory', 'size': '-', 'modified': '-'}
    else:
        stat = os.stat(path)
        return {
            'type': 'file',
            'size': humanize.naturalsize(stat.st_size),
            'modified': datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d %H:%M')
        }

@app.route('/')
def index():
    """文件管理器主页"""
    current_path = request.args.get('path', '')
    if not current_path:
        current_path = app.config['UPLOAD_FOLDER']
    
    # 确保路径安全
    if not current_path.startswith(app.config['UPLOAD_FOLDER']):
        current_path = app.config['UPLOAD_FOLDER']
    
    files = []
    try:
        for item in os.listdir(current_path):
            item_path = os.path.join(current_path, item)
            file_info = get_file_info(item_path)
            files.append({
                'name': item,
                'path': item_path,
                'type': file_info['type'],
                'size': file_info['size'],
                'modified': file_info['modified']
            })
    except Exception as e:
        return f"无法访问目录: {str(e)}"
    
    # 排序：目录在前，文件在后
    files.sort(key=lambda x: (x['type'] != 'directory', x['name'].lower()))
    
    parent_dir = os.path.dirname(current_path) if current_path != app.config['UPLOAD_FOLDER'] else None
    
    return render_template('index.html', 
                         files=files, 
                         current_path=current_path,
                         parent_dir=parent_dir)

@app.route('/upload', methods=['POST'])
def upload_file():
    """文件上传"""
    if 'file' not in request.files:
        return jsonify({'error': '没有选择文件'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '没有选择文件'})
    
    if file:
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)
        return jsonify({'success': f'文件 {filename} 上传成功'})
    
    return jsonify({'error': '上传失败'})

@app.route('/download/<path:filename>')
def download_file(filename):
    """文件下载"""
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    return "文件不存在", 404

@app.route('/delete/<path:filename>')
def delete_file(filename):
    """删除文件"""
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    try:
        if os.path.exists(file_path):
            if os.path.isdir(file_path):
                os.rmdir(file_path)
            else:
                os.remove(file_path)
            return jsonify({'success': '删除成功'})
        return jsonify({'error': '文件不存在'})
    except Exception as e:
        return jsonify({'error': f'删除失败: {str(e)}'})

@app.route('/create_folder', methods=['POST'])
def create_folder():
    """创建文件夹"""
    folder_name = request.json.get('name')
    if folder_name:
        folder_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(folder_name))
        try:
            os.makedirs(folder_path, exist_ok=True)
            return jsonify({'success': '文件夹创建成功'})
        except Exception as e:
            return jsonify({'error': f'创建失败: {str(e)}'})
    return jsonify({'error': '文件夹名不能为空'})

if __name__ == '__main__':
    # 创建模板目录
    templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
    os.makedirs(templates_dir, exist_ok=True)
    
    # 创建HTML模板
    with open(os.path.join(templates_dir, 'index.html'), 'w') as f:
        f.write('''
<!DOCTYPE html>
<html>
<head>
    <title>手机文件管理器</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .header { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .file-list { background: white; border-radius: 10px; overflow: hidden; }
        .file-item { padding: 15px; border-bottom: 1px solid #eee; display: flex; align-items: center; }
        .file-item:hover { background: #f9f9f9; }
        .file-icon { margin-right: 15px; font-size: 20px; }
        .file-info { flex: 1; }
        .file-actions { display: flex; gap: 10px; }
        .btn { padding: 5px 10px; border: none; border-radius: 3px; cursor: pointer; text-decoration: none; color: white; }
        .btn-download { background: #4CAF50; }
        .btn-delete { background: #f44336; }
        .btn-upload { background: #2196F3; margin: 10px; }
        .upload-area { border: 2px dashed #ccc; padding: 20px; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📁 手机文件管理器</h1>
        <p>当前路径: {{ current_path }}</p>
        {% if parent_dir %}
        <a href="/?path={{ parent_dir }}" class="btn" style="background: #666;">📂 返回上级</a>
        {% endif %}
    </div>

    <div class="upload-area">
        <h3>📤 上传文件</h3>
        <input type="file" id="fileInput" multiple>
        <button class="btn btn-upload" onclick="uploadFiles()">开始上传</button>
        <div id="uploadStatus"></div>
    </div>

    <div class="file-list">
        {% for file in files %}
        <div class="file-item">
            <div class="file-icon">
                {% if file.type == 'directory' %}
                📁
                {% else %}
                📄
                {% endif %}
            </div>
            <div class="file-info">
                <strong>
                    {% if file.type == 'directory' %}
                    <a href="/?path={{ file.path }}">{{ file.name }}</a>
                    {% else %}
                    {{ file.name }}
                    {% endif %}
                </strong>
                <br>
                <small>大小: {{ file.size }} | 修改: {{ file.modified }}</small>
            </div>
            <div class="file-actions">
                {% if file.type == 'file' %}
                <a href="/download/{{ file.name }}" class="btn btn-download">下载</a>
                {% endif %}
                <button class="btn btn-delete" onclick="deleteItem('{{ file.name }}')">删除</button>
            </div>
        </div>
        {% endfor %}
    </div>

    <script>
    function uploadFiles() {
        const files = document.getElementById('fileInput').files;
        const status = document.getElementById('uploadStatus');
        
        if (files.length === 0) {
            status.innerHTML = '请选择文件';
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                status.innerHTML = '✅ ' + data.success;
                setTimeout(() => location.reload(), 1000);
            } else {
                status.innerHTML = '❌ ' + data.error;
            }
        })
        .catch(error => {
            status.innerHTML = '❌ 上传失败: ' + error;
        });
    }

    function deleteItem(filename) {
        if (confirm('确定要删除 ' + filename + ' 吗？')) {
            fetch('/delete/' + filename)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('删除成功');
                        location.reload();
                    } else {
                        alert('删除失败: ' + data.error);
                    }
                });
        }
    }
    </script>
</body>
</html>
        ''')
    
    app.run(host='0.0.0.0', port=5001, debug=False)
