He utilitzat ChatGPT4 com a IA i s'ha utilitzat en:
-----------------
Prompt: Necessito canviar només el camp status d’una tasca en Flutter, però mantenint iguals la resta de camps. Quina funció podria afegir al model?
Solució: 
Task copyWith({
  String? status,
}) {
  return Task(
    id: id,
    titulo: titulo,
    fechaInicio: fechaInicio,
    fechaFin: fechaFin,
    usuarios: usuarios,
    status: status ?? this.status,
  );
}
-----------------
Prompt: Vull crear una pantalla nova en Flutter tipus Kanban. Ha de mostrar tres columnes: To do, In progress i Done. Cada columna ha de mostrar les tasques filtrades pel seu status.
TaskBoardScreen(
  organizacionId: widget.organization.id,
)
_TaskColumn(
  title: 'Done',
  status: 'done',
  tasks: doneTasks...,
)
-----------------
Prompt: Com puc fer que una tasca es pugui moure entre columnes en Flutter i que quan es deixi anar canviï el seu status?
LongPressDraggable<Task>(
  data: task,
  child: _buildCard(),
  feedback: Material(
    child: _buildCard(),
  ),
)
----------------
Prompt: Quan creo una tasca des de Flutter, el backend em retorna l’error "status is not allowed". El backend ja té status amb default todo. Què hauria de fer?
Corregir i no enviar el camp status:
body: jsonEncode({
  'titulo': titulo,
  'fechaInicio': fechaInicio.toIso8601String(),
  'fechaFin': fechaFin.toIso8601String(),
  'usuarios': usuarios,
});