from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from .storage import ensure_storage_dir


def is_prefect_available() -> bool:
    try:
        import prefect  # noqa: F401
        return True
    except Exception:
        return False


def write_pipeline_code(project_id: str, deployment_id: str, code: str) -> Path:
    root = ensure_storage_dir()
    flows_dir = root / "flows"
    flows_dir.mkdir(parents=True, exist_ok=True)
    code_path = flows_dir / f"{project_id}_{deployment_id}_pipeline.py"
    with code_path.open("w", encoding="utf-8") as f:
        f.write(code)
    return code_path


def register_prefect_deployment(name: str, project_id: str, deployment_id: str, code_path: Path) -> Dict[str, Any]:
    """Create a minimal Prefect deployment pointing to a simple runner flow.

    If Prefect isn't available, returns { "registered": False }.
    """
    try:
        from prefect import flow
        from prefect.deployments import Deployment

        @flow(name="pipeline-runner")
        def run_pipeline(code_path: str):  # pragma: no cover - runtime wrapper
            # For demonstration we only print the path; users can extend to execute PySpark
            print(f"Prefect running pipeline at {code_path}")

        dep = Deployment.build_from_flow(
            flow=run_pipeline,
            name=name,
            parameters={"code_path": str(code_path)},
        )
        dep.apply()
        return {"registered": True, "name": name}
    except Exception as exc:
        return {"registered": False, "error": str(exc)}


