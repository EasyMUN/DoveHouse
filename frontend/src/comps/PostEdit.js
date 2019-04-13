import React, { useCallback, useState } from 'react';

import { makeStyles } from '@material-ui/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';

const styles = makeStyles(theme => ({
  dialogRoot: {
    width: 'calc(100% - 96px)',
  },
}));

export default ({
  onSubmit,
  ...rest,
}) => {
  const cls = styles();

  const [title, setTitle] = useState('');
  const [main, setMain] = useState('');

  const changeTitle = useCallback(ev => setTitle(ev.target.value), [setTitle]);
  const changeMain = useCallback(ev => setMain(ev.target.value), [setMain]);

  const submit = useCallback(() => {
    if(onSubmit)
      onSubmit({ title, main });
  }, [title, main, onSubmit]);

  return <Dialog {...rest} scroll="body" classes={{
    paper: cls.dialogRoot,
  }}>
    <DialogContent>
      <TextField
        label="标题"
        fullWidth
        variant="filled"
        margin="normal"

        value={title}
        onChange={changeTitle}
      />
      <TextField
        label="正文 (Markdown) "
        fullWidth
        variant="filled"
        multiline
        rows={5}
        margin="normal"

        value={main}
        onChange={changeMain}
      />
    </DialogContent>
    <DialogActions>
      <Button color="secondary" onClick={submit}>发布</Button>
    </DialogActions>
  </Dialog>;
}
