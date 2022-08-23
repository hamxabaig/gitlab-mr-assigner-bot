resource "aws_ecs_service" "gitlab_mr_bot_service" {
  name            = "${var.info.ecs_service}"
  cluster         = "${aws_ecs_cluster.integration-cluster.id}"
  task_definition = "${aws_ecs_task_definition.gitlab_mr_bot_task.arn}"
  launch_type     = "EC2"
  desired_count   = 1
}
