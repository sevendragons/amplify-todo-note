// eslint-disable
// this is an auto generated file. This will be overwritten

export const getTodoNote = `query GetTodoNote($id: ID!) {
  getTodoNote(id: $id) {
    id
    note
  }
}
`;
export const listTodoNotes = `query ListTodoNotes(
  $filter: ModelTodoNoteFilterInput
  $limit: Int
  $nextToken: String
) {
  listTodoNotes(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      note
    }
    nextToken
  }
}
`;
