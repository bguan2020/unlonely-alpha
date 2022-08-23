import { gql } from "apollo-server-express";

export const typeDef = gql`
  type Task {
    id: ID!
    taskType: String!
    youtubeId: String
    title: String
    thumbnail: String
    link: String
    description: String
    completed: Boolean!
    owner: User!
    createdAt: DateTime!
    updatedAt: DateTime!
    isDeleted: Boolean
  }

  input TaskFeedInput {
    searchString: String
    skip: Int
    limit: Int
    orderBy: SortOrder
  }

  input PostTaskInput {
    taskType: String!
    youtubeId: String
    title: String
    thumbnail: String
    description: String
    link: String
  }

  extend type Query {
    getTaskFeed(data: TaskFeedInput): [Task]
  }

  extend type Mutation {
    postTask(data: PostTaskInput!): Task
    softDeleteTask(id: ID!): Boolean
  }
`;
