resource "aws_ecs_cluster" "integration-cluster" {
	name = var.info.cluster_name	
}
