import 'package:flutter/material.dart';
import '../models/task.dart';
import '../services/organization_service.dart';

class TaskBoardScreen extends StatefulWidget {
  final String organizacionId;

  const TaskBoardScreen({
    super.key,
    required this.organizacionId,
  });

  @override
  State<TaskBoardScreen> createState() => _TaskBoardScreenState();
}

class _TaskBoardScreenState extends State<TaskBoardScreen> {
  final OrganizationService _organizationService = OrganizationService();

  List<Task> _tasks = [];
  bool _isLoading = true;
  String _errorMessage = '';
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final List<Task> tasks =
          await _organizationService.fetchTasksByOrganization(
        widget.organizacionId,
      );

      if (!mounted) return;

      setState(() {
        _tasks = tasks;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _updateTaskStatus(Task task, String newStatus) async {
    if (_isUpdating || task.status == newStatus) {
      return;
    }

    setState(() {
      _isUpdating = true;
      _tasks = _tasks
          .map(
            (Task currentTask) => currentTask.id == task.id
                ? currentTask.copyWith(status: newStatus)
                : currentTask,
          )
          .toList();
    });

    try {
      await _organizationService.updateTaskStatus(
        organizacionId: widget.organizacionId,
        taskId: task.id,
        status: newStatus,
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No se pudo actualizar la tarea: $e')),
      );

      await _loadTasks();
    } finally {
      if (mounted) {
        setState(() {
          _isUpdating = false;
        });
      }
    }
  }

  String _formatDate(DateTime date) {
    final String day = date.day.toString().padLeft(2, '0');
    final String month = date.month.toString().padLeft(2, '0');
    final String year = date.year.toString();
    return '$day/$month/$year';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text('Tauler de tasques'),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: _loadTasks,
            icon: const Icon(Icons.refresh),
            tooltip: 'Refrescar',
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage.isNotEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Error: $_errorMessage',
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    final List<Task> todoTasks =
        _tasks.where((Task task) => task.status == 'todo').toList();

    final List<Task> inProgressTasks =
        _tasks.where((Task task) => task.status == 'in_progress').toList();

    final List<Task> doneTasks =
        _tasks.where((Task task) => task.status == 'done').toList();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _TaskColumn(
            title: 'To do',
            status: 'todo',
            tasks: todoTasks,
            onTaskDropped: _updateTaskStatus,
            formatDate: _formatDate,
          ),
          const SizedBox(width: 16),
          _TaskColumn(
            title: 'In progress',
            status: 'in_progress',
            tasks: inProgressTasks,
            onTaskDropped: _updateTaskStatus,
            formatDate: _formatDate,
          ),
          const SizedBox(width: 16),
          _TaskColumn(
            title: 'Done',
            status: 'done',
            tasks: doneTasks,
            onTaskDropped: _updateTaskStatus,
            formatDate: _formatDate,
          ),
        ],
      ),
    );
  }
}

class _TaskColumn extends StatelessWidget {
  final String title;
  final String status;
  final List<Task> tasks;
  final void Function(Task task, String status) onTaskDropped;
  final String Function(DateTime date) formatDate;

  const _TaskColumn({
    required this.title,
    required this.status,
    required this.tasks,
    required this.onTaskDropped,
    required this.formatDate,
  });

  @override
  Widget build(BuildContext context) {
    return DragTarget<Task>(
      onAcceptWithDetails: (DragTargetDetails<Task> details) {
        onTaskDropped(details.data, status);
      },
      builder: (
        BuildContext context,
        List<Task?> candidateData,
        List<dynamic> rejectedData,
      ) {
        final bool isHovering = candidateData.isNotEmpty;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 310,
          constraints: BoxConstraints(
            minHeight: MediaQuery.of(context).size.height - 160,
          ),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isHovering ? Colors.blue.shade50 : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: isHovering ? Colors.blueAccent : Colors.grey.shade300,
              width: isHovering ? 2 : 1,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _ColumnHeader(
                title: title,
                count: tasks.length,
                status: status,
              ),
              const SizedBox(height: 12),
              if (tasks.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Text(
                    'No hay tareas',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                )
              else
                ...tasks.map(
                  (Task task) => _TaskCard(
                    task: task,
                    formatDate: formatDate,
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

class _ColumnHeader extends StatelessWidget {
  final String title;
  final int count;
  final String status;

  const _ColumnHeader({
    required this.title,
    required this.count,
    required this.status,
  });

  Color get _color {
    switch (status) {
      case 'in_progress':
        return Colors.orange;
      case 'done':
        return Colors.green;
      case 'todo':
      default:
        return Colors.blueAccent;
    }
  }

  IconData get _icon {
    switch (status) {
      case 'in_progress':
        return Icons.timelapse;
      case 'done':
        return Icons.check_circle;
      case 'todo':
      default:
        return Icons.radio_button_unchecked;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(_icon, color: _color),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: _color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            count.toString(),
            style: TextStyle(
              color: _color,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
}

class _TaskCard extends StatelessWidget {
  final Task task;
  final String Function(DateTime date) formatDate;

  const _TaskCard({
    required this.task,
    required this.formatDate,
  });

  @override
  Widget build(BuildContext context) {
    return LongPressDraggable<Task>(
      data: task,
      feedback: Material(
        color: Colors.transparent,
        child: SizedBox(
          width: 280,
          child: _buildCard(opacity: 0.9),
        ),
      ),
      childWhenDragging: Opacity(
        opacity: 0.35,
        child: _buildCard(),
      ),
      child: _buildCard(),
    );
  }

  Widget _buildCard({double opacity = 1}) {
    return Opacity(
      opacity: opacity,
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                task.titulo,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.calendar_today, size: 16),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Inicio: ${formatDate(task.fechaInicio)}',
                      style: const TextStyle(fontSize: 13),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.event_available, size: 16),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Fin: ${formatDate(task.fechaFin)}',
                      style: const TextStyle(fontSize: 13),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.drag_indicator, size: 18),
                  const SizedBox(width: 4),
                  Text(
                    'Mantén pulsado y arrastra',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}