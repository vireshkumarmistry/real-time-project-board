import { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useSelector } from "../store";

const Notifier = () => {
  const { error } = useSelector((state) => state.auth);
  const { error: projectError } = useSelector((state) => state.projects);
  const { error: taskError } = useSelector((state) => state.tasks);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: "error" });
  }, [error, enqueueSnackbar]);

  useEffect(() => {
    if (projectError) enqueueSnackbar(projectError, { variant: "error" });
  }, [projectError, enqueueSnackbar]);

  useEffect(() => {
    // Prevent double error toast for delete or update task
    if (taskError && !/delete|update|edit/i.test(taskError)) {
      enqueueSnackbar(taskError, { variant: "error" });
    }
  }, [taskError, enqueueSnackbar]);

  return null;
};

export default Notifier;
