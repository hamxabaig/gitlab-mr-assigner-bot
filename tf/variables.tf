variable "info" {
  type = object({
    cluster_name  = string
    ecr_repo = string
		ecs_task = string
		ecs_service = string
  })
}

