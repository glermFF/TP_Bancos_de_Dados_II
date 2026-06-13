import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { AuthCard, authStyles } from '../../components/AuthCard';
import { Field } from '../../components/Field';
import { Button } from '../../components/Button';
import { Hoverable } from '../../components/Hoverable';
import { useAuth } from '../../context/AuthContext';
import { apiErrorMessage } from '../../services/api';
import { copy } from '../../copy/strings';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SignUpScreen() {
  const nav = useNavigation<Nav>();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    setError(null);
    if (password !== confirm) { setError(copy.signUp.mismatch); return; }
    setBusy(true);
    try {
      await signUp({ name, username, email, password });
      nav.navigate('Home');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen active="SignUp">
      <AuthCard
        docLabel={copy.signUp.docLabel}
        title={<>{copy.signUp.title}</>}
        subtitle={copy.signUp.subtitle}
      >
        {error ? <Text style={authStyles.error}>{error}</Text> : null}
        <Field label={copy.signUp.name} placeholder={copy.signUp.namePlaceholder} value={name} onChangeText={setName} />
        <Field label={copy.signUp.username} hint={copy.signUp.usernameHint} placeholder={copy.signUp.usernamePlaceholder} value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Field label={copy.signUp.email} placeholder={copy.signUp.emailPlaceholder} value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" />
        <Field label={copy.signUp.password} hint={copy.signUp.passwordHint} placeholder={copy.signUp.passwordPlaceholder} value={password} onChangeText={setPassword} secureTextEntry />
        <Field label={copy.signUp.confirm} placeholder={copy.signUp.confirmPlaceholder} value={confirm} onChangeText={setConfirm} secureTextEntry onSubmitEditing={submit} />
        <Button label={busy ? copy.signUp.submitting : copy.signUp.submit} full disabled={busy} onPress={submit} />
        <View style={authStyles.switchRow}>
          <Text style={authStyles.switchText}>{copy.signUp.switchText}</Text>
          <Hoverable onPress={() => nav.navigate('SignIn')}>
            <Text style={authStyles.switchLink}>{copy.signUp.switchLink}</Text>
          </Hoverable>
        </View>
      </AuthCard>
    </Screen>
  );
}
